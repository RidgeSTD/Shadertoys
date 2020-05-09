// Advection fragment program
// q(x, t + ∂t) = q(x - u(x, t)∂t, t)

#define h 2.

vec2 eulerInte(vec2 p) {
    vec2 v = texture(iChannel0, p / iResolution.xy).xy;
    return p - v * iTimeDelta;
}

vec2 Rk4Inte(vec2 p) {
    vec2 r = iResolution.xy;
    vec2 k1 = texture(iChannel0, p / r).xy;
    vec2 k2 = texture(iChannel0, (p - 0.5 * h * k1) / r).xy;
    vec2 k3 = texture(iChannel0, (p - 0.5 * h * k2) / r).xy;
    vec2 k4 = texture(iChannel0, (p - h * k3) / r).xy;
    return p - h / 3. * (0.5 * k1 + k2 + k3 + 0.5 * k4);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 pos = uv * 2. - 1.;
    pos.x *= iResolution.x / iResolution.y;
    float r = length(pos);

    
    vec2 preUV = eulerInte(fragCoord) / iResolution.xy;
    //vec2 preUV = Rk4Inte(fragCoord) / iResolution.xy;
    preUV = clamp(preUV, 0., 1.);
    vec4 newV = texture(iChannel0, preUV);  // TODO: bilerp

    // initial condition
    if (r < 0.03) {
        newV.xy = vec2(0, 100);
        newV.w = 1.; // dye density
    }	

    // boundary condition
    if (fragCoord.x < 2. || fragCoord.x > iResolution.x - 2. || fragCoord.y < 2. ||
        fragCoord.y > iResolution.y - 2.)
        newV.xy = vec2(0);
    fragColor = newV;
}