// gradient subtraction fragment program

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float pL, pR, pB, pT;
    pL = texture(iChannel0, (fragCoord - vec2(1, 0)) / iResolution.xy).z;
    pR = texture(iChannel0, (fragCoord + vec2(1, 0)) / iResolution.xy).z;
    pB = texture(iChannel0, (fragCoord - vec2(0, 1)) / iResolution.xy).z;
    pT = texture(iChannel0, (fragCoord + vec2(0, 1)) / iResolution.xy).z;

    // Because trirop's pressure solver use the reverse axis direction as ours
    vec2 grad = -HALF_RDX * vec2(pR - pL, pT - pB);

    fragColor = texture(iChannel1, fragCoord / iResolution.xy);

    fragColor.xy -= grad;
}