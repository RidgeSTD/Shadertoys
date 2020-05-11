void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // buffer A stores the (vx, vy, 0, d):
    //  - vx, vy: velocity in two directions
    //  - w: dye density

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
    vec3 wick_hot = mix(FLAME_COL, vec3(0.), smoothstep(-0.1, 0.2, length(pos - (WICK_POS + vec2(0.05, 0.2)))));
    wick_hot = mix(vec3(0), wick_hot, w);
    color += wick_hot;
    color = SAT(color);

    // fake light
    w = smoothstep(0.5, 0., length(pos - WICK_POS)) * 8.;
    color *= w;
    color = SAT(color);

    //    ______
    //   / __/ /__ ___ _  ___
    //  / _// / _ `/  ' \/ -_)
    // /_/ /_/\_,_/_/_/_/\__/
    float a2 = 0.01;
    float b2 = 0.09;
    float x2;
    float y2;
    vec3 flameCol = vec3(0);

    // left petal
    a2 = 0.01;
    b2 = 0.25;
    x2 = (pos.x - WICK_POS.x + 0.05) / (WICK_POS.y + 1. - pos.y) * .7;
    x2 *= x2;
    y2 = pos.y - WICK_POS.y;
    y2 *= y2;
    w = x2 / a2 + y2 / b2;
    w = smoothstep(.8, .5, w);
    w *= smoothstep(0.02, 0., pos.x - WICK_POS.x);
    flameCol += vec3(w);
	fragColor = vec4(w);
    //return;
    
    // middle petal
    // a2 = 0.01;
    b2 = 0.28;
	x2 = (pos.x - WICK_POS.x) / (WICK_POS.y + 1. - pos.y) * .7;
    x2 *= x2;
    y2 = pos.y - WICK_POS.y - 0.0;
    y2 *= y2;
    w = x2 / a2 + y2 / b2;
    w = smoothstep(.8, .5, w);
    //w *= smoothstep(0.1, 0., abs(pos.x - WICK_POS.x));
    flameCol += vec3(w);
    fragColor = vec4(w);
    fragColor = vec4(flameCol, 1.);
    return;

    //    ____           __
    //   / __/_ _  ___  / /_____
    //  _\ \/  ' \/ _ \/  '_/ -_)
    // /___/_/_/_/\___/_/\_\\__/
    // density
    color.xyz += vec3(texture(iChannel0, uv).w);

    fragColor = vec4(color, 1.);
}