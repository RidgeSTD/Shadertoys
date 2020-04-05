// https://www.shadertoy.com/view/4djSRW by David Hoskins
float hash12(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Four corners in 2D of a tile
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.;
    v += noise(p) * 0.5	   ; p *= 2.01;
    v += noise(p) * 0.25   ; p *= 2.02;
    v += noise(p) * 0.125  ; p *= 2.03;
    v += noise(p) * 0.0625 ; p *= 2.04;
    v += noise(p) * 0.03125;
    return v / 0.96875;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = uv * 2. - 1.;
    p.x *= iResolution.x / iResolution.y;
    
    float r2 = dot(p, p);
    float a = atan(p.y, p.x);
    
    vec3 bkg = vec3(uv.x);
    
    //vec3 col = mix(vec3(1), bkg, smoothstep(0.37, 0.45, r2) );
    vec3 col = vec3(0.);
    
    a += 0.7 * fbm(vec2(a, r2));
    col = mix (vec3(0.55,0.42,0.19), col, fbm(vec2(20. * a, r2 * 0.5)));

    //a *= 5. * fbm(vec2(a, r2));
    vec3 inner_col = mix (vec3(0,1,0), col, fbm(vec2(a, r2)));
        
        
    // pupil
    col = mix(vec3(0.), col, smoothstep(0.03, 0.05, r2));
    
    // rim
    col = mix(col, vec3(0.), smoothstep(0.3, 0.5, r2));
    
    // bkg
    vec3 bkg_col = mix(vec3(1.0), vec3(0.4), smoothstep(0.8, 8.0, r2));
    col = mix(col, bkg_col, smoothstep(0.42, 0.5, r2));

    fragColor = vec4(col,1.);
}