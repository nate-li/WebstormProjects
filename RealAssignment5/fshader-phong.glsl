#version 300 es
precision highp float;

in vec4 AmbientDiffuseColor;
in vec4 SpecularColor;
in float SpecularExponent;
in vec4 eyepos;
in vec3 oL;
in vec3 oE;
in vec3 oN;
in vec3 oH;
in vec2 ftexCoord;

out vec4  fColor;

uniform vec4 light_color;
uniform vec4 ambient_light;
uniform highp mat4 model_view;
uniform sampler2D textureSampler;

void main()
{
    vec4 amb = AmbientDiffuseColor * ambient_light;
    vec4 diff = max(dot(normalize(oL), normalize(oN)),0.0) * AmbientDiffuseColor * light_color;
    vec4 spec = SpecularColor * light_color * pow(max(dot(normalize(oN), normalize(oH)),0.0), SpecularExponent);
    if(dot(normalize(oL),normalize(oN)) < 0.0)
    {
        spec = vec4(0,0,0,1);

    }

    vec4 color = diff + amb + spec;

    fColor = texture(textureSampler, ftexCoord);
    //fColor = color;

}





