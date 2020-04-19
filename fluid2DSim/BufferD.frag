// gradient subtraction fragment program

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float halfrdx = 0.5;
    vec2 uv = fragCoord / iResolution.xy;

    ivec2 coord = ivec2(fragCoord);
    float pL = texelFetch(iChannel0, coord + ivec2(-1, 0), 0).z;
    float pR = texelFetch(iChannel0, coord + ivec2(1, 0), 0).z;
    float pB = texelFetch(iChannel0, coord + ivec2(0, -1), 0).z;
    float pT = texelFetch(iChannel0, coord + ivec2(0, 1), 0).z;
    
    vec2 grad = halfrdx * vec2(pR - pL, pT - pB);

    vec4 w = texelFetch(iChannel1, coord, 0);
    fragColor = w - vec4(grad, 0,0);
    
    
//    fragColor = texture(iChannel1, uv); // DEBUG
}