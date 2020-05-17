// Advection fragment program
// q(x, t + ∂t) = q(x - u(x, t)∂t, t)

// buffer A stores the (vx, vy, T, d):
//  - vx, vy: velocity in two directions
//  - T: temperatore
//  - d: smoke density

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
    float asp_ratio = iResolution.x / iResolution.y;
    pos.x *= asp_ratio;
    bool lit = mod(iTime, ANIM_DUR) < LIT_DUR;

    vec2 preUV = eulerInte(fragCoord) / iResolution.xy;
    // vec2 preUV = Rk4Inte(fragCoord) / iResolution.xy;
    preUV = SAT(preUV);
    vec4 newV = texture(iChannel0, preUV);

    // apply diffusion
    newV *= DIFFUSE_VEC;

    // hot air and smoke
    // reference: Fedkiw et al. 2001
    // reference: https://youtu.be/mLp_rSBzteI?t=40
    vec2 wickTipPos = WICK_POS + vec2(0.035, WICK_LEN * 2.);
    float cool = COOLING(mod(iTime, ANIM_DUR) - LIT_DUR);
    if (length(pos - wickTipPos) < 0.02) {
        if (lit) {
            newV.z = WICK_TEMP;
        } else {
            newV.z = AMBIENT_TEMP + TEMP_DIFF * cool;
            newV.w = SAT(cool * 3.);
        }
    }
    vec2 forceBuoyancy = vec2(0, -SMOKE_GRAVITY_FACT * newV.w + SMOKE_TEMP_FACT * max(0., newV.z - AMBIENT_TEMP));
    newV.xy += forceBuoyancy;

    // viscosity term
    vec2 gL = xyGrad(iChannel0, fragCoord - vec2(1, 0), iResolution.xy);
    vec2 gR = xyGrad(iChannel0, fragCoord + vec2(1, 0), iResolution.xy);
    vec2 gB = xyGrad(iChannel0, fragCoord - vec2(0, 1), iResolution.xy);
    vec2 gT = xyGrad(iChannel0, fragCoord + vec2(0, 1), iResolution.xy);
    vec2 lapU = (gR - gL + gT - gB) * HALF_RDX;
    newV.xy += VISCOCITY * lapU * iTimeDelta;

    // close boundary condition, pure Neumann pressure boundary
    if (fragCoord.x < 2. || fragCoord.x > iResolution.x - 2. || fragCoord.y < 2. || fragCoord.y > iResolution.y - 2.) {
        newV.xy = vec2(0);
    }

    fragColor = newV;
}