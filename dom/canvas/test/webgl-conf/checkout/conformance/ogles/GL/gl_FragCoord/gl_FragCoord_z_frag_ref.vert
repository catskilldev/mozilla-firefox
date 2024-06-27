
/*
Copyright (c) 2019 The Khronos Group Inc.
Use of this source code is governed by an MIT-style license that can be
found in the LICENSE.txt file.
*/


attribute vec4 gtf_Vertex;
uniform mat4 gtf_ModelViewProjectionMatrix;
varying vec4 position;

void main(void)
{
	gl_Position = gtf_ModelViewProjectionMatrix * gtf_Vertex;

	// Vertex's clip coordinates
	position = gl_Position;
}
