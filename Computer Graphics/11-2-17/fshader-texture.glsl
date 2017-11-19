#version 300 es
precision mediump float;

//The texture coordinate interpolated from vertices to this fragment
in vec2 ftexCoord;
//This is our sampler that is connected to a specific texture
uniform sampler2D textureSampler;

out vec4  fColor;

void main()
{

    // look up the relevant coordinates in the sampler and use that as our fragment color
    fColor =texture(textureSampler, ftexCoord);
}