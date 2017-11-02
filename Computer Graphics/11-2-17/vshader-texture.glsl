#version 300 es

in vec4 vPosition;
//Each vertex has a texture coordinate
in vec2 texCoord;
//Interpolate those to each fragment
out vec2 ftexCoord;

uniform mat4 model_view;
uniform mat4 projection;
void main()
{	

    ftexCoord = texCoord;

	gl_Position = projection * model_view*vPosition;
	

}