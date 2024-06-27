/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include rect,render_task,gpu_cache,transform

#define EXTEND_MODE_CLAMP  0
#define EXTEND_MODE_REPEAT 1

#define SUBPX_DIR_NONE        0
#define SUBPX_DIR_HORIZONTAL  1
#define SUBPX_DIR_VERTICAL    2
#define SUBPX_DIR_MIXED       3

#define RASTER_LOCAL            0
#define RASTER_SCREEN           1

uniform sampler2D sClipMask;

#ifndef SWGL_CLIP_MASK
// TODO: convert back to RectWithEndpoint if driver issues are resolved, if ever.
flat varying mediump vec4 vClipMaskUvBounds;
varying highp vec2 vClipMaskUv;
#endif

#ifdef WR_VERTEX_SHADER

#define COLOR_MODE_ALPHA                0
#define COLOR_MODE_SUBPX_DUAL_SOURCE    1
#define COLOR_MODE_BITMAP_SHADOW        2
#define COLOR_MODE_COLOR_BITMAP         3
#define COLOR_MODE_IMAGE                4
#define COLOR_MODE_MULTIPLY_DUAL_SOURCE 5

uniform HIGHP_SAMPLER_FLOAT sampler2D sPrimitiveHeadersF;
uniform HIGHP_SAMPLER_FLOAT isampler2D sPrimitiveHeadersI;

// Instanced attributes
PER_INSTANCE in ivec4 aData;

#define VECS_PER_PRIM_HEADER_F 2U
#define VECS_PER_PRIM_HEADER_I 2U

struct Instance
{
    int prim_header_address;
    int clip_address;
    int segment_index;
    int flags;
    int resource_address;
    int brush_kind;
};

Instance decode_instance_attributes() {
    Instance instance;

    instance.prim_header_address = aData.x;
    instance.clip_address = aData.y;
    instance.segment_index = aData.z & 0xffff;
    instance.flags = aData.z >> 16;
    instance.resource_address = aData.w & 0xffffff;
    instance.brush_kind = aData.w >> 24;

    return instance;
}

struct PrimitiveHeader {
    RectWithEndpoint local_rect;
    RectWithEndpoint local_clip_rect;
    float z;
    int specific_prim_address;
    int transform_id;
    int picture_task_address;
    ivec4 user_data;
};

PrimitiveHeader fetch_prim_header(int index) {
    PrimitiveHeader ph;

    ivec2 uv_f = get_fetch_uv(index, VECS_PER_PRIM_HEADER_F);
    vec4 local_rect = TEXEL_FETCH(sPrimitiveHeadersF, uv_f, 0, ivec2(0, 0));
    vec4 local_clip_rect = TEXEL_FETCH(sPrimitiveHeadersF, uv_f, 0, ivec2(1, 0));
    ph.local_rect = RectWithEndpoint(local_rect.xy, local_rect.zw);
    ph.local_clip_rect = RectWithEndpoint(local_clip_rect.xy, local_clip_rect.zw);

    ivec2 uv_i = get_fetch_uv(index, VECS_PER_PRIM_HEADER_I);
    ivec4 data0 = TEXEL_FETCH(sPrimitiveHeadersI, uv_i, 0, ivec2(0, 0));
    ivec4 data1 = TEXEL_FETCH(sPrimitiveHeadersI, uv_i, 0, ivec2(1, 0));
    ph.z = float(data0.x);
    ph.specific_prim_address = data0.y;
    ph.transform_id = data0.z;
    ph.picture_task_address = data0.w;
    ph.user_data = data1;

    return ph;
}

struct VertexInfo {
    vec2 local_pos;
    vec4 world_pos;
};

VertexInfo write_vertex(vec2 local_pos,
                        RectWithEndpoint local_clip_rect,
                        float z,
                        Transform transform,
                        PictureTask task) {
    // Clamp to the two local clip rects.
    vec2 clamped_local_pos = rect_clamp(local_clip_rect, local_pos);

    // Transform the current vertex to world space.
    vec4 world_pos = transform.m * vec4(clamped_local_pos, 0.0, 1.0);

    // Convert the world positions to device pixel space.
    vec2 device_pos = world_pos.xy * task.device_pixel_scale;

    // Apply offsets for the render task to get correct screen location.
    vec2 final_offset = -task.content_origin + task.task_rect.p0;

    gl_Position = uTransform * vec4(device_pos + final_offset * world_pos.w, z * world_pos.w, world_pos.w);

    VertexInfo vi = VertexInfo(
        clamped_local_pos,
        world_pos
    );

    return vi;
}

RectWithEndpoint clip_and_init_antialiasing(RectWithEndpoint segment_rect,
                                            RectWithEndpoint prim_rect,
                                            RectWithEndpoint clip_rect,
                                            int edge_flags,
                                            float z,
                                            Transform transform,
                                            PictureTask task) {
#ifdef SWGL_ANTIALIAS
    // Check if the bounds are smaller than the unmodified segment rect. If so,
    // it is safe to enable AA on those edges.
    bvec4 clipped = bvec4(greaterThan(clip_rect.p0, segment_rect.p0),
                          lessThan(clip_rect.p1, segment_rect.p1));
    swgl_antiAlias(edge_flags | (clipped.x ? 1 : 0) | (clipped.y ? 2 : 0) |
                   (clipped.z ? 4 : 0) | (clipped.w ? 8 : 0));
#endif

    segment_rect.p0 = clamp(segment_rect.p0, clip_rect.p0, clip_rect.p1);
    segment_rect.p1 = clamp(segment_rect.p1, clip_rect.p0, clip_rect.p1);

#ifndef SWGL_ANTIALIAS
    prim_rect.p0 = clamp(prim_rect.p0, clip_rect.p0, clip_rect.p1);
    prim_rect.p1 = clamp(prim_rect.p1, clip_rect.p0, clip_rect.p1);

    // Select between the segment and prim edges based on edge mask.
    // We must perform the bitwise-and for each component individually, as a
    // vector bitwise-and followed by conversion to bvec4 causes shader
    // compilation crashes on some Adreno devices. See bug 1715746.
    bvec4 clip_edge_mask = bvec4(bool(edge_flags & 1), bool(edge_flags & 2), bool(edge_flags & 4), bool(edge_flags & 8));
    rectangle_aa_vertex(mix(
        vec4(vec2(-1e16), vec2(1e16)),
        vec4(segment_rect.p0, segment_rect.p1),
        clip_edge_mask
    ));

    // As this is a transform shader, extrude by 2 (local space) pixels
    // in each direction. This gives enough space around the edge to
    // apply distance anti-aliasing. Technically, it:
    // (a) slightly over-estimates the number of required pixels in the simple case.
    // (b) might not provide enough edge in edge case perspective projections.
    // However, it's fast and simple. If / when we ever run into issues, we
    // can do some math on the projection matrix to work out a variable
    // amount to extrude.

    // Only extrude along edges where we are going to apply AA.
    float extrude_amount = 2.0;
    vec4 extrude_distance = mix(vec4(0.0), vec4(extrude_amount), clip_edge_mask);
    segment_rect.p0 -= extrude_distance.xy;
    segment_rect.p1 += extrude_distance.zw;
#endif

    return segment_rect;
}

void write_clip(vec4 world_pos, ClipArea area, PictureTask task) {
#ifdef SWGL_CLIP_MASK
    swgl_clipMask(
        sClipMask,
        (task.task_rect.p0 - task.content_origin) - (area.task_rect.p0 - area.screen_origin),
        area.task_rect.p0,
        rect_size(area.task_rect)
    );
#else
    vec2 uv = world_pos.xy * area.device_pixel_scale +
        world_pos.w * (area.task_rect.p0 - area.screen_origin);
    vClipMaskUvBounds = vec4(
        area.task_rect.p0,
        area.task_rect.p1
    );
    vClipMaskUv = uv;
#endif
}

// Read the exta image data containing the homogeneous screen space coordinates
// of the corners, interpolate between them, and return real screen space UV.
vec2 get_image_quad_uv(int address, vec2 f) {
    ImageSourceExtra extra_data = fetch_image_source_extra(address);
    vec4 x = mix(extra_data.st_tl, extra_data.st_tr, f.x);
    vec4 y = mix(extra_data.st_bl, extra_data.st_br, f.x);
    vec4 z = mix(x, y, f.y);
    return z.xy / z.w;
}
#endif //WR_VERTEX_SHADER

#ifdef WR_FRAGMENT_SHADER

struct Fragment {
    vec4 color;
#ifdef WR_FEATURE_DUAL_SOURCE_BLENDING
    vec4 blend;
#endif
};

float do_clip() {
#ifdef SWGL_CLIP_MASK
    // SWGL relies on builtin clip-mask support to do this more efficiently,
    // so no clipping is required here.
    return 1.0;
#else
    // check for the dummy bounds, which are given to the opaque objects
    if (vClipMaskUvBounds.xy == vClipMaskUvBounds.zw) {
        return 1.0;
    }
    // anything outside of the mask is considered transparent
    //Note: we assume gl_FragCoord.w == interpolated(1 / vClipMaskUv.w)
    vec2 mask_uv = vClipMaskUv * gl_FragCoord.w;
    bvec2 left = lessThanEqual(vClipMaskUvBounds.xy, mask_uv); // inclusive
    bvec2 right = greaterThan(vClipMaskUvBounds.zw, mask_uv); // non-inclusive
    // bail out if the pixel is outside the valid bounds
    if (!all(bvec4(left, right))) {
        return 0.0;
    }
    // finally, the slow path - fetch the mask value from an image
    return texelFetch(sClipMask, ivec2(mask_uv), 0).r;
#endif
}

#endif //WR_FRAGMENT_SHADER
