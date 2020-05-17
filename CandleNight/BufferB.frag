// calculate the divergence

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float wL = texture(iChannel0, (fragCoord - vec2(1, 0))/iResolution.xy).x;
    float wR = texture(iChannel0, (fragCoord + vec2(1, 0))/iResolution.xy).x;
    float wB = texture(iChannel0, (fragCoord - vec2(0, 1))/iResolution.xy).y;
    float wT = texture(iChannel0, (fragCoord + vec2(0, 1))/iResolution.xy).y;
    float div = (wR - wL + wT - wB) * HALF_RDX;

    fragColor = vec4(div, 0.0, 0.0, 0.0);
}