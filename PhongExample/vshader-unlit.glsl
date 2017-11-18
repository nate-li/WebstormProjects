#version 300 es

in vec4 vPosition;
in vec4 vAmbientDiffuseColor;

out vec4 color;

uniform mat4 model_view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * model_view * vPosition;
	color = vAmbientDiffuseColor;
}