void bgCandle(inout vec4 col, vec2 pos, vec2 bgXY, float r, float intensity) {
    float w = smoothstep(r, r - 0.02, length(pos - bgXY)) * 0.7 * blink(iTime * 2. + hash2(bgXY));
    col.xyz = mix(col.xyz, SAT(BG_COL * intensity), w);
    col.w = 1. - (1. - col.w) * (1. - w);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // buffer A/D stores the (vx, vy, t, d):
    //  - vx, vy: velocity in two directions
    //  - t: temperature
    //  - d: smoke density

    bool lit = mod(iTime, ANIM_DUR) < LIT_DUR;

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;
    float asp_ratio = iResolution.x / iResolution.y;
    vec2 pos = (uv * 2. - 1.);
    pos.x *= asp_ratio;
    float w;

    //    ___           __                              __
    //   / _ )___ _____/ /_____ ________  __ _____  ___/ /
    //  / _  / _ `/ __/  '_/ _ `/ __/ _ \/ // / _ \/ _  /
    // /____/\_,_/\__/_/\_\\_, /_/  \___/\_,_/_//_/\_,_/
    //                    /___/
    vec4 bkg = vec4(0);
    bkg.rgb = mix(bkg.rgb, BG_COL, smoothstep(.8, -1.5, abs(uv.y - .3)));

    for (float i = -2.; i < 2.; i += .5) {
        bgCandle(bkg, pos, vec2(i, -.3 + .2 * hash2(vec2(i, 2.))), 0.16, .9);
    }
    for (float i = -2.; i < 2.; i += .7) {
        bgCandle(bkg, pos, vec2(i, -.1 + .3 * hash2(vec2(i * 2., 5.))), 0.14, 1.);
    }
    for (float i = -2.; i < 2.; i += .86) {
        bgCandle(bkg, pos, vec2(i * i, -0.3 + .2 * hash2(vec2(i * 3., 3.))), 0.187, .7);
    }

    //   _____             ____
    //  / ___/__ ____  ___/ / /__
    // / /__/ _ `/ _ \/ _  / / -_)
    // \___/\_,_/_//_/\_,_/_/\__/
    vec4 color = vec4(0);
    w = smoothstep(CANDLE_HALF_WIDTH, 0.18, abs(pos.x - WICK_POS.x));
    w = mix(w, 0., smoothstep(WICK_POS.y - 0.01, WICK_POS.y, pos.y - 0.04 + 0.15 * texture(iChannel2, uv).r));
    color.rgb = mix(color.rgb, CANDLE_COL, w);
    color.a += w;
    color.rgb *= 0.25;  // fake candle shadow

    // wick
    w = smoothstep(0.02, 0.01, abs(pos.x - WICK_POS.x - 1. + cos((pos.y - WICK_POS.y) * 2.)));
    w = mix(w, 0., step(WICK_LEN, abs(pos.y - WICK_POS.y - WICK_LEN)));

    vec3 wickColor = vec3(w);
    color.rgb -= wickColor;
    color.a += w;
    color = SAT(color);
    vec3 wickHot = mix(FLAME_COL, vec3(0.), smoothstep(-0.1, 0.2, length(pos - (WICK_POS + vec2(0.05, 0.2)))));
    wickHot = mix(vec3(0), wickHot, w);
    color.rgb += wickHot;
    color = SAT(color);

    // fake light
    vec2 wickTipPos = WICK_POS + vec2(0.035, WICK_LEN * 2.);
    w = mix(smoothstep(0.15, 0.08, length(pos - wickTipPos)) * 4., smoothstep(0.5, 0., length(pos - wickTipPos)) * 8.,
            float(lit));
    color.rgb *= max(1., w);
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
        color.a += w;

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

        color.rgb += SAT(flameCol);
        color.a += w;
    }

    //    ____           __
    //   / __/_ _  ___  / /_____
    //  _\ \/  ' \/ _ \/  '_/ -_)
    // /___/_/_/_/\___/_/\_\\__/
    // density
    if (!lit) color += vec4(texture(iChannel0, uv).w);
    color = SAT(color);

    fragColor = vec4(mix(bkg.xyz, color.rgb, color.a), 1);

    // visualise velocity
    // fragColor = vec4(texture(iChannel0, uv).xyz, 1);
}