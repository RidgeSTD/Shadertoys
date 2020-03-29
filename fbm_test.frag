// TODO:
float hash(vec2 p)  // replace this by something better
{
    p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
    return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );
}


float my_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Four corners in 2D of a tile
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix( mix(a, b, u.x),
            	mix(c, d, u.x), u.y );
    
}


float fbm(vec2 p) {
    // Properties
    const int octaves = 8;
    mat2 lacunarity = mat2( 1.6,  1.2, -1.2,  1.6 );
    float gain = 0.5;

    // Initial values
    float amplitude = 0.7;
    float v = 0.;
    
    // Loop of octaves
    for (int i = 0; i < octaves; i++) {
        v += amplitude * my_noise(p);
        p = lacunarity * p;
        amplitude *= gain;
    }

    return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = fragCoord / iResolution.xy;
    vec2 uv = p*vec2(iResolution.x/iResolution.y,1.0);
    
    vec3 col = vec3(0.15,0.39,0.62);
    col = mix(col, vec3(1.), fbm(uv));

    // Output to screen
    fragColor = vec4(col, 1.0);
}