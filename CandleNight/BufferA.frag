// Advection fragment program
// q(x, t + ∂t) = q(x - u(x, t)∂t, t)

// buffer A stores the (vx, vy, var, d):
//  - vx, vy: velocity in two directions
//  - T: temperatore
//  - w: smoke density

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
    // float r = length(pos);

    vec2 preUV = eulerInte(fragCoord) / iResolution.xy;
    // vec2 preUV = Rk4Inte(fragCoord) / iResolution.xy;
    preUV = SAT(preUV);
    vec4 newV = texture(iChannel0, preUV);

    // apply diffusion
    newV *= DIFFUSE_VEC;    

    // hot air and smoke
    // reference: Fedkiw et al. 2001
    // reference: https://youtu.be/mLp_rSBzteI?t=40
    float wickTemperature = AMBIENT_TEMP + TEMP_DIFF * COOLING(iTime);
    if (length(pos - WICK_POS) < 0.05) {
        newV.z = wickTemperature;
        newV.w = 1.;
    }
    const float alpha = 0.2;
    const float beta = 0.2;
    vec2 forceBuoyancy = vec2(0, -alpha * newV.w + beta * max(0., newV.z - AMBIENT_TEMP));
    newV.xy += forceBuoyancy;

    // // open boundary condition
    // if (fragCoord.x < 1.) {
    //     newV.xy = texture(iChannel0, uv + vec2(1, 0) / iResolution.xy).xy;
    // }
    // if (fragCoord.x > iResolution.x - 2.) {
    //     newV.xy = texture(iChannel0, uv - vec2(1, 0) / iResolution.xy).xy;
    // }
    // if (fragCoord.y < 1.) {
    //     newV.xy = texture(iChannel0, uv + vec2(0, 1) / iResolution.xy).xy;
    // }
    // if (fragCoord.y > iResolution.y - 2.) {
    //     newV.xy = texture(iChannel0, uv - vec2(0, 1) / iResolution.xy).xy;
    // }

    // close boundary condition, pure Neumann pressure boundary
    if (fragCoord.x < 2. || fragCoord.x > iResolution.x - 2. || fragCoord.y < 2. || fragCoord.y > iResolution.y - 2.) {
        newV.xy = vec2(0);
    }

    /*
        // mouse interaction
        // generate source
        vec2 mouse;
        if (length(iMouse.xy) < 0.01) {
            mouse = vec2(0);
        } else {
            mouse = (iMouse.xy / iResolution.xy) * 2. - 1.;
            mouse.x *= asp_ratio;
        }
        if (iMouse.z > .5) {
            if (length(pos - mouse) < .03 && iMouse.z > 0.) {
                newV.w = 1.;  // dye density
            }
            if (abs(pos.x - mouse.x) < 0.1 && abs(pos.y - mouse.y) < 0.03) {
                newV.xy = vec2(0, PUMP_SPEED);
            }
        }

        // detect click
        if (iFrame < 1) {
            newV.z = 0.;
        }
        ivec2 ifc = ivec2(fragCoord.xy);
        if (ifc.x == 0 && ifc.y == 0) {
            float lastClickTime = texelFetch(iChannel1, ivec2(0, 1), 0).z;
            if (iMouse.z > 0.5 && iTime - lastClickTime > CLICK_INTERVAL) {
                newV.z = 1. - newV.z;  // flip the lit condition
            }
        }
        // filter redundant clicks with time interval of 0.3
        if (ifc.x == 0 && ifc.y == 1) {
            float lastClickTime = texelFetch(iChannel1, ifc, 0).z;
            if (iMouse.z > .5 && iTime - lastClickTime > CLICK_INTERVAL) {
                newV.z = iTime;
            }
        }
    */
    fragColor = newV;
}