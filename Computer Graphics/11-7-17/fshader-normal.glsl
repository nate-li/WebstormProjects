#version 300 es

precision highp float;

in vec2 ftexCoord;
in vec3 vT;
in vec3 vN;
in vec4 position;

uniform vec4 light_position;
uniform vec4 light_color;
uniform vec4 ambient_light;
uniform sampler2D colorMap;
uniform sampler2D normalMap;

out vec4  fColor;

void main()
{

    //This normal is the legitimate normal vector of the real geometry
	vec3 norm = normalize(vN);
	vec3 T = normalize(vT);

	//TODO calculate a binormal that is perpendicular to both the normal and tangent
    vec3 binormal = cross(T, norm);
	//TODO create a change in coordinate frame matrix from your tangent (x) binormal (y) and normal (z) directions
    mat4 frame = mat4(vec4(T, 0), vec4(binormal, 0), vec4(norm, 0), vec4(0, 0, 0, 1));
	//and now let's do phong lighting

	vec3 L = normalize(light_position - position).xyz;
	vec3 E = normalize(-position).xyz;
	//TODO vec3 N = [look up our "high detail" normal vector from the normal map]
    vec4 N = texture(normalMap, ftexCoord);


	//TODO and transform that from tangent space into eye space using our matrix
    N = N * 2.0;
    N = N - 1.0;
    N = frame * N;

	vec4 amb = texture(colorMap, ftexCoord) * ambient_light;
	vec4 diff = max(dot(L,N.xyz), 0.0) * light_color * texture(colorMap, ftexCoord);//TODO use color texture in place of vAmbientDiffuseColor;
	//bricks aren't shiny, so we'll skip the specular term on this one
	fColor = amb + diff;

}