#version 300 es
 precision mediump float;
 in vec4 color;
 out vec4  fColor;

 void main()
 {
     fColor = color;
     vec4 amb = vAmbientDiffuseColor * ambient_light;
     vec4 diff = max(dot(L, N), 0.0)* vAmbientDiffuseColor * light_color;
     vec4 spec = vSpecularColor * light_color * pow(max(dot(N, H), 0.0), vSpecularExponent);
     if(dot(L, N) < 0.0){//back side
         spec = vec4(0, 0, 0, 1);
     }

     gl_Position = projection * veyepos;

     color = amb + diff + spec;
 }