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
    const vec3 kCandleColor = vec3(0.92,0.02,0.21);
    float w = smoothstep(CANDLE_HALF_WIDTH, 0.18, abs(pos.x - WICK_X));
    w = mix(w, 0., smoothstep(WICK.y, WICK.y + 0.01, pos.y));
    color = mix(color, kCandleColor, w);
    
    // shadow
    w = smoothstep(0.2, 0.8, length(pos - WICK));
    color -= vec3(w);
    
    // wick
    vec3 wick_hot = mix(vec3(1.00,1.00,0.65), 
                        vec3(0.),
                        smoothstep(0.02, 0.15, length(pos - (WICK + vec2(0.05, 0.1)))));
    // fragColor = vec4(wick_hot,1.);
    // return;
                       
    w = smoothstep(0.02, 0.01, abs(pos.x - WICK.x - 1. + cos(pos.y * 2. - WICK.y + 0.12)));
    w = mix(w, 0., step(0.1, abs(pos.y - WICK.y - 0.103)));
    // wick_hot = mix(vec3(0), wick_hot, w);
    // fragColor = vec4(wick_hot,1.);
    vec3 wickColor = vec3(w);
    color += wickColor;


    //    ____           __
    //   / __/_ _  ___  / /_____
    //  _\ \/  ' \/ _ \/  '_/ -_)
    // /___/_/_/_/\___/_/\_\\__/
    // density
    color.xyz += vec3(texture(iChannel0, uv).w);

    fragColor = vec4(color, 1.);
}