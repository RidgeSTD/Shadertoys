// gradient subtraction fragment program

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float halfrdx = 0.5;
    vec2 uv = fragCoord / iResolution.xy;

    float pL, pR, pB, pT;
    // close boundary condition, set offset
    // no-slip velocity boundary, pure Neumann pressure boundary condition
    // Eq.18 calculated using forward difference approximation of derivative
    vec2 convertedCoord = fragCoord;

    // // close boundary condition, set offset
    // // no-slip velocity boundary, pure Neumann pressure boundary condition
    // // Eq.18 calculated using forward
    // if (fragCoord.x < 2.) {
    //     pL = texture(iChannel0, vec2(1, fragCoord.y) / iResolution.xy).z;
    // } else {
    //     pL = texture(iChannel0, (fragCoord - vec2(1, 0)) / iResolution.xy).z;
    // }
    // if (fragCoord.x > iResolution.x - 3.) {
    //     pL = texture(iChannel0, vec2(iResolution.x - 2., fragCoord.y) / iResolution.xy).z;
    // } else {
    //     pR = texture(iChannel0, (fragCoord + vec2(1, 0)) / iResolution.xy).z;
    // }
    // if (fragCoord.y < 2.) {
    //     pB = texture(iChannel0, vec2(fragCoord.x, 1) / iResolution.xy).z;
    // } else {
    //     pB = texture(iChannel0, (fragCoord - vec2(0, 1)) / iResolution.xy).z;
    // }
    // if (fragCoord.y > iResolution.y - 3.) {
    //     pT = texture(iChannel0, vec2(fragCoord.x, iResolution.y - 2.) / iResolution.xy).z;
    // } else {
    //     pT = texture(iChannel0, (fragCoord + vec2(0, 1)) / iResolution.xy).z;
    // }

    pL = texture(iChannel0, (convertedCoord - vec2(1, 0)) / iResolution.xy).z;
    pR = texture(iChannel0, (convertedCoord + vec2(1, 0)) / iResolution.xy).z;
    pB = texture(iChannel0, (convertedCoord - vec2(0, 1)) / iResolution.xy).z;
    pT = texture(iChannel0, (convertedCoord + vec2(0, 1)) / iResolution.xy).z;

    // Because trirop's pressure solver use the reverse axis direction as ours
    vec2 grad = -halfrdx * vec2(pR - pL, pT - pB);

    fragColor = texture(iChannel1, fragCoord / iResolution.xy);

    fragColor.xy -= grad;
}