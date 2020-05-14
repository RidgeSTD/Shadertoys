void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // debug
    fragColor = texture(iChannel1, fragCoord/iResolution.xy);
    //return;
    
    // buffer A stores the (vx, vy, var, d):
    //  - vx, vy: velocity in two directions
    //  - var: global variables accross frames
    //  - w: dye density

    bool lit = texture(iChannel1, vec2(0)).z < 0.1;

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;
    float asp_ratio = iResolution.x / iResolution.y;
    vec2 pos = (uv * 2. - 1.);
    pos.x *= asp_ratio;

    vec3 color = vec3(0.04, 0.05, 0.10);
    //   _____             ____
    //  / ___/__ ____  ___/ / /__
    // / /__/ _ `/ _ \/ _  / / -_)
    // \___/\_,_/_//_/\_,_/_/\__/
    float w = smoothstep(CANDLE_HALF_WIDTH, 0.18, abs(pos.x - WICK_POS.x));
    w = mix(w, 0., smoothstep(WICK_POS.y, WICK_POS.y + 0.01, pos.y));
    color = mix(color, CANDLE_COL, w);
    color *= 0.125;  // fake candle shadow

    // wick
    w = smoothstep(0.02, 0.01, abs(pos.x - WICK_POS.x - 1. + cos((pos.y - WICK_POS.y) * 2.)));
    w = mix(w, 0., step(0.07, abs(pos.y - WICK_POS.y - 0.075)));

    vec3 wickColor = vec3(w);
    color -= wickColor;
    color = SAT(color);
    vec3 wickHot = mix(FLAME_COL, vec3(0.), smoothstep(-0.1, 0.2, length(pos - (WICK_POS + vec2(0.05, 0.2)))));
    wickHot = mix(vec3(0), wickHot, w);
    color += wickHot;
    color = SAT(color);

    // fake light
    if (lit) {
        w = smoothstep(0.5, 0., length(pos - WICK_POS)) * 8.;
        color *= w;
        color = SAT(color);
    }

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

        color += SAT(flameCol);
    }

    //    ____           __
    //   / __/_ _  ___  / /_____
    //  _\ \/  ' \/ _ \/  '_/ -_)
    // /___/_/_/_/\___/_/\_\\__/
    // density
    color.xyz += vec3(texture(iChannel0, uv).w);

    //    __  ___
    //   /  |/  /__  __ _____ ___
    //  / /|_/ / _ \/ // (_-</ -_)
    // /_/  /_/\___/\_,_/___/\__/

    fragColor = vec4(color, 1.);
    
    // visualise velocity
    // fragColor = vec4(texture(iChannel0, uv).xyz, 1);
}