// The MIT License
// Copyright © 2020 Ridge/winlandiano
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
// notice and this permission notice shall be included in all copies or substantial portions of the Software. THE
// SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Smoke simulation with navier-stokes fluid dynamics. Buoyancy refers to Fedkiw et al. 2001. Hope to create a feel of a
// jazz bar but still short of:
// 1. flame animation
// 2. 3D volumetric
// 3. Wax (pseudo)subsurface scattering
// Thanks to trirop for the great single step jacobi-resolver!
// Refer to GPU Gems chap. 38: Fast Fluid Dynamics Simulation on the GPU to more detail.

void bgCandle(inout vec4 col, vec2 pos, vec2 bgXY, float r, float intensity) {
    float w = smoothstep(r, r - 0.02, length(pos - bgXY)) * 0.7 * blink(iTime * 2. + hash2(bgXY));
    col.xyz = mix(col.xyz, SAT(BG_COL * intensity), w);
    col.w = 1. - (1. - col.w) * (1. - w);
}

vec2 flameFlicker(vec2 pos) {
    vec2 res = pos;
    float t = iTime;
    float w = smoothstep(.2, -.2, abs(sin(t))) * .3;
    w += smoothstep(.2, -.2, abs(sin(t + 1.))) * -0.2;
    w += sin(t) * .1;
    w += sin(2. * t) * .05;
    w += sin(4. * t) * .024;
    res += vec2(w * SAT(pos.y - WICK_POS.y), 0);
    w = smoothstep(0.7, -0.7, abs(sin(t))) * 0.2;
    res += vec2(0, SAT(pos.y - WICK_POS.y) * w);
    return res;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // buffer A/D stores the (vx, vy, t, d):
    //  - vx, vy: velocity in two directions
    //  - t: temperature
    //  - d: smoke density

    bool lit = mod(iTime, ANIM_DUR) < LIT_DUR;
    float fLit = float(lit);

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
            fLit);
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
        vec2 ffPos = flameFlicker(pos);
        x2 = (ffPos.x - 0.02 - WICK_POS.x) / (WICK_POS.y + 1.5 - ffPos.y) * .7;
        x2 *= x2;
        y2 = ffPos.y - WICK_POS.y - .38;
        y2 *= y2;
        distortion = x2 / a2 + y2 / b2;
        w = smoothstep(.8, .6, distortion);
        flameCol += w * FLAME_COL * (1. + 2. * smoothstep(1.5, -2., distortion));
        color.a += w;

        // bottom black
        a2 = 0.0004;
        b2 = 0.04;
        x2 = (ffPos.x - 0.02 - WICK_POS.x) / (WICK_POS.y + 1.5 - ffPos.y * 15.);
        x2 *= x2;
        y2 = ffPos.y - WICK_POS.y - 0.19;
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
    color += mix(vec4(texture(iChannel0, uv).w), vec4(0), fLit);
    color = SAT(color);

    fragColor = vec4(mix(bkg.xyz, color.rgb, color.a), 1);

    // visualise velocity
    // fragColor = vec4(texture(iChannel0, uv).xyz, 1);
}