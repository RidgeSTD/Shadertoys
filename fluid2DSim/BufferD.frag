// gradient subtraction fragment program

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float halfrdx = 0.5;
    
    float pL = texture(iChannel0, (fragCoord - vec2(1, 0)) / iResolution.xy).z;
    float pR = texture(iChannel0, (fragCoord + vec2(1, 0)) / iResolution.xy).z;
    float pB = texture(iChannel0, (fragCoord - vec2(0, 1)) / iResolution.xy).z;
    float pT = texture(iChannel0, (fragCoord + vec2(0, 1)) / iResolution.xy).z;
    
    // Because trirop's pressure solver use the reverse axis direction as ours
    vec2 grad = -halfrdx * vec2(pR - pL, pT - pB);
    
    fragColor = texture(iChannel1, fragCoord / iResolution.xy);
    
    fragColor.xy -= grad;
}