// Advection fragment program
// q(x, t + ∂t) = q(x - u(x, t)∂t, t)

vec2 eulerInte(vec2 p, vec2 uv) { return p - texture(iChannel0, uv).xy * iTimeDelta; }

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 pos = uv * 2. - 1.;
    pos.x *= iResolution.x / iResolution.y;
    float r = length(pos);

    // initial condition

    if (r < 0.03) {
        fragColor = vec4(-0.1, 0.3, 0.2, 1);  // x, y, pressure, density
    //if (sin(fragCoord.y / 2.) > 0.4 && uv.x < 0.005) {
    //    fragColor = vec4(1,0,0.2, 1);
    } else {
        if (iFrame < 4) {
            fragColor = vec4(0, 0, 0, 0);
        } else {
            vec2 preUV = eulerInte(uv, uv);
            vec4 newV = texture(iChannel0, preUV);  // TODO: bilerp

            fragColor = newV;
        }
    }
}