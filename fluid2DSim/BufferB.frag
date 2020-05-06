// calculate the divergence

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    ivec2 coord = ivec2(fragCoord);
    vec4 col = texelFetch(iChannel0, coord, 0);

    // we assume grid scale to be one
    const float halfrdx = 0.5 /* / grid scale */; 

    float wL = texelFetch(iChannel0, coord + ivec2(-1, 0), 0).x;
    float wR = texelFetch(iChannel0, coord + ivec2(1, 0), 0).x;
    float wB = texelFetch(iChannel0, coord + ivec2(0, -1), 0).y;
    float wT = texelFetch(iChannel0, coord + ivec2(0, 1), 0).y;
    float div = (wR - wL + wT - wB) * halfrdx;

    fragColor = vec4(div, 0.0, 0.0, 0.0);
}