// TODO: replace this by something better
float hash2(vec2 p) {
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float hash3(vec3 p) {
    p = fract(p * 0.3183099 + .1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float my_noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Four corners in 2D of a tile
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// value noise
float my_noise3(vec3 p) {
    // grid
    vec3 i = floor(p);
    vec3 f = fract(p);

    // quintic interpolant
    // vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    // cubic interpolant
    vec3 u = f * f * (3. - 2. * f);

    float va = hash3(i + vec3(0.0, 0.0, 0.0));
    float vb = hash3(i + vec3(1.0, 0.0, 0.0));
    float vc = hash3(i + vec3(0.0, 1.0, 0.0));
    float vd = hash3(i + vec3(1.0, 1.0, 0.0));
    float ve = hash3(i + vec3(0.0, 0.0, 1.0));
    float vf = hash3(i + vec3(1.0, 0.0, 1.0));
    float vg = hash3(i + vec3(0.0, 1.0, 1.0));
    float vh = hash3(i + vec3(1.0, 1.0, 1.0));

    // two bi-linear interpolation
    return mix( mix(mix(va, vb, u.x), 
                    mix(vc, vd, u.x), 
                    u.y),
                mix(mix(ve, vf, u.x),
                    mix(vg, vh, u.x),
                    u.y),
                u.z
    );
}

float fbm2(vec2 p) {
    // Properties
    const int octaves = 8;
    // mat2 lacunarity = mat2(1.6, 1.2, -1.2, 1.6);
    float lacunarity = 2.;
    float gain = 0.5;

    // Initial values
    float amplitude = 0.7;
    float v = 0.;

    // Loop of octaves
    for (int i = 0; i < octaves; i++) {
        v += amplitude * my_noise2(p);
        p = lacunarity * p;
        amplitude *= gain;
    }

    return v;
}

float fbm3(vec3 p) {
    const int octaves = 8;
    float lacunarity = 2.;
    float gain = 0.5;

    float amplitude = 0.7;
    float v = 0.;

    for (int i = 0; i < octaves; i++) {
        v += amplitude * my_noise3(p);
        p = lacunarity * p;
        amplitude *= gain;
    }

    return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = fragCoord / iResolution.xy;
    vec2 uv = p * vec2(iResolution.x / iResolution.y, 1.0);

    vec3 col = vec3(0.15, 0.39, 0.62);
    col = mix(col, vec3(1.), fbm3(vec3(uv, iTime)));

    // Output to screen
    fragColor = vec4(col, 1.0);
}