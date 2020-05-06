// Advection fragment program
// q(x, t + ∂t) = q(x - u(x, t)∂t, t)

vec2 eulerInte(vec2 p, vec2 uv) { return p - texture(iChannel0, uv).xy * iTimeDelta; }

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 pos = uv * 2. - 1.;
    pos.x *= iResolution.x / iResolution.y;
    float r = length(pos);

    if (r < 0.03) {
        fragColor = vec4(0, 1, 0.2, 1);  // x, y, pressure, density
        // if (sin(fragCoord.y / 2.) > 0.4 && uv.x < 0.005) {
        //    fragColor = vec4(1,0,0.2, 1);
    } else {
        vec2 preUV = eulerInte(fragCoord, uv) / iResolution.xy;
        preUV = clamp(preUV, 0., 1.);
        vec4 newV = texture(iChannel0, preUV);  // TODO: bilerp

        // boundary condition
#if 0
        if (fragCoord.x < 2.) newV.xy = vec2(1, 0);
        if (fragCoord.x > iResolution.x - 2.) newV.xy = vec2(-1, 0);
        if (fragCoord.y < 2.) newV.xy = vec2(0, 1);
        if (fragCoord.y > iResolution.y - 2.) newV.xy = vec2(0, -1);
#else
        if (fragCoord.x < 2. || fragCoord.x > iResolution.x - 2. || fragCoord.y < 2. ||
            fragCoord.y > iResolution.y - 2.)
            newV.xy = vec2(0);
        fragColor = newV;
#endif
    }
}