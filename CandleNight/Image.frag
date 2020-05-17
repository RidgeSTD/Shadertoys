void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // buffer A/D stores the (vx, vy, t, d):
    //  - vx, vy: velocity in two directions
    //  - t: temperature
    //  - d: smoke density

    bool lit = mod(iTime, ANIM_DUR) < LIT_DUR;
    bool litF = lit;

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;
    float asp_ratio = iResolution.x / iResolution.y;
    vec2 pos = (uv * 2. - 1.);
    pos.x *= asp_ratio;

    //    ___           __                              __
    //   / _ )___ _____/ /_____ ________  __ _____  ___/ /
    //  / _  / _ `/ __/  '_/ _ `/ __/ _ \/ // / _ \/ _  /
    // /____/\_,_/\__/_/\_\\_, /_/  \___/\_,_/_//_/\_,_/
    //                    /___/
    vec4 bkg = vec4(0);

    //   _____             ____
    //  / ___/__ ____  ___/ / /__
    // / /__/ _ `/ _ \/ _  / / -_)
    // \___/\_,_/_//_/\_,_/_/\__/
    vec4 color = vec4(0);
    float w = smoothstep(CANDLE_HALF_WIDTH, 0.18, abs(pos.x - WICK_POS.x));
    w = mix(w, 0., smoothstep(WICK_POS.y - 0.01, WICK_POS.y, pos.y));
    color = mix(color, vec4(CANDLE_COL, 1), w);
    color.xyz *= 0.125;  // fake candle shadow

    // wick
    w = smoothstep(0.02, 0.01, abs(pos.x - WICK_POS.x - 1. + cos((pos.y - WICK_POS.y) * 2.)));
    w = mix(w, 0., step(WICK_LEN, abs(pos.y - WICK_POS.y - WICK_LEN)));

    vec3 wickColor = vec3(w);
    color.xyz -= wickColor;
    color.a += w;
    color = SAT(color);
    vec3 wickHot = mix(FLAME_COL, vec3(0.), smoothstep(-0.1, 0.2, length(pos - (WICK_POS + vec2(0.05, 0.2)))));
    wickHot = mix(vec3(0), wickHot, w);
    color.xyz += wickHot;
    color = SAT(color);

    // fake light
    vec2 wickTipPos = WICK_POS + vec2(0.035, WICK_LEN * 2.);
    w = mix(smoothstep(0.15, 0.08, length(pos - wickTipPos)) * 8., smoothstep(0.5, 0., length(pos - wickTipPos)) * 8.,
            lit);
    color *= w;
    color = SAT(color);

    //    ______
    //   / __/ /__ ___ _  ___
    //  / _// / _ `/  ' \/ -_)
    // /_/ /_/\_,_/_/_/_/\__/
    if (lit) {
        float a2, b2, x2, y2, distortion;
        vec3 flameCol = vec3(0);

        // left petal
        // a2 = 0.01;
        // b2 = 0.25;
        // x2 = (pos.x - WICK_POS.x + 0.05) / (WICK_POS.y + 1. - pos.y) * .7;
        // x2 *= x2;
        // y2 = pos.y - WICK_POS.y;
        // y2 *= y2;
        // w = x2 / a2 + y2 / b2;
        // w = smoothstep(.8, .5, w);
        // w *= smoothstep(0.02, 0., pos.x - WICK_POS.x);
        // flameCol += vec3(w);

        // middle petal
        a2 = 0.01;
        b2 = 0.15;
        x2 = (pos.x - 0.02 - WICK_POS.x) / (WICK_POS.y + 1.5 - pos.y) * .7;
        x2 *= x2;
        y2 = pos.y - WICK_POS.y - .38;
        y2 *= y2;
        distortion = x2 / a2 + y2 / b2;
        w = smoothstep(.8, .6, distortion);
        flameCol += w * FLAME_COL * (1. + 2. * smoothstep(1.5, -2., distortion));
        color.w += w;

        // bottom black
        a2 = 0.0004;
        b2 = 0.04;
        x2 = (pos.x - 0.02 - WICK_POS.x) / (WICK_POS.y + 1.5 - pos.y * 15.);
        x2 *= x2;
        y2 = pos.y - WICK_POS.y - 0.19;
        y2 *= y2;
        distortion = x2 / a2 + y2 / b2;
        w = smoothstep(.6, -.2, distortion);
        flameCol -= vec3(w) * 2.;

        color.xyz += SAT(flameCol);
        color.w += w;
    }

    //    ____           __
    //   / __/_ _  ___  / /_____
    //  _\ \/  ' \/ _ \/  '_/ -_)
    // /___/_/_/_/\___/_/\_\\__/
    // density
    if (!lit) color += vec4(texture(iChannel0, uv).w);
    color = SAT(color);

    fragColor = vec4(mix(bkg.xyz, color.xyz, color.w), 1);

    // visualise velocity
    // fragColor = vec4(texture(iChannel0, uv).xyz, 1);
}