
/*
Copyright (c) 2019 The Khronos Group Inc.
Use of this source code is governed by an MIT-style license that can be
found in the LICENSE.txt file.
*/


attribute vec4 gtf_Color;
attribute vec4 gtf_Vertex;
uniform mat4 gtf_ModelViewProjectionMatrix;
varying vec4 color;

void main (void)
{
	const vec2 edge0 = vec2(0.25, 0.25);
	const vec2 edge1 = vec2(0.75, 0.75);
	vec2 c = clamp((gtf_Color.rg - edge0) / (edge1 - edge0), 0.0, 1.0);
	color = vec4(c * c * (3.0 - 2.0 * c), 0.0, 1.0);
	gl_Position = gtf_ModelViewProjectionMatrix * gtf_Vertex;
}
