#version 300 es
in vec4 vPosition;
in vec4 vAmbientDiffuseColor;
in vec4 vNormal;
in vec4 vSpecularColor;
in float vSpecularExponent;
in vec2 texCoord;

out vec4 AmbientDiffuseColor;
out vec4 SpecularColor;
out float SpecularExponent;
out vec4 eyepos;
out vec3 oL;
out vec3 oE;
out vec3 oH;
out vec3 oN;
out vec2 ftexCoord;

uniform mat4 model_view;
uniform mat4 projection;
uniform vec4 light_position;
uniform vec4 light_color;
uniform vec4 ambient_light;



void main()
{

    AmbientDiffuseColor = vAmbientDiffuseColor;
    SpecularColor = vSpecularColor;
    SpecularExponent = vSpecularExponent;

    eyepos = model_view * vPosition;
    oL = normalize(light_position.xyz - eyepos.xyz);
    oE = normalize(-eyepos.xyz);
    oH = normalize(oL+oE); //halfway between light direction and camera direction, avg of 2 vectors
    oN = normalize(model_view * vNormal).xyz;

    ftexCoord = texCoord;

    gl_Position = projection * eyepos;


}





