#iChannel0 "file://BufferA.frag"

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;

    // gamma
    vec3 col = pow(texture(iChannel0, uv).xyz, vec3(0.4545));;

    fragColor = vec4(col,1.0);
}