#define PI 3.14159265359
#define PI2 1.57079632679

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

// exponentialy increase and decrease between 0 and 1
float damping_step(float a, float b, float x) {
    float f = smoothstep(a, b, sin(x));
    float loose = log(max(f, 1e-7)) * 0.15 + 1.;
    float tight = -log(max(1. - f, 1e-7)) * 0.15;
    f = step(0., cos(x));
    float v = mix(tight, loose, f);
    v = clamp(v, 0., 1.);
    return v;
}

const float eye_r = 1.2;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = uv * 2. - 1.;
    p.x *= iResolution.x / iResolution.y;
    float time = iTime;
    
    vec3 ro = vec3(0, 0, 3.);
    vec3 target = vec3(0, 0, -3);
    vec3 right = normalize(cross(target, vec3(0., 1., 0.)));
    vec3 up = normalize(cross(right, target));
    right = normalize(cross(target, up));
	vec3 rd = normalize((p.x*right + p.y*up) - target);
    

    
    float r2 = dot(p, p);
    float a = atan(p.y, p.x);
    
    float light_intensity = 0.5 + 0.3 * smoothstep(-0.5, 0.5, sin(time));

    // eye reaction delay
    const float REACT_TIME = 0.2;
    time -= REACT_TIME;
    float pupil_var = 0.008 + damping_step(-0.5, 0.5, time) * 0.03;
    time += REACT_TIME;
    
    //vec3 col = mix(vec3(1), bkg, smoothstep(0.37, 0.45, r2) );
    vec3 col = vec3(0.85, 0.4, 0.1);
    
    a += 0.7 * fbm(vec2(a, r2));
   	vec3 outter_col = mix (vec3(0.55,0.42,0.19), col, fbm(vec2(200. * a, 100. * r2)));
    a += 0.7 * fbm(vec2(a, r2));
    vec3 inner_col = mix (vec3(0.55,0.42,0.19), col, fbm(vec2(80. * a, 0.5 * r2)));
	
    float rim_var = fbm(3. * p);
    rim_var *= rim_var;
    col = mix( inner_col, outter_col, smoothstep(0.16, 0.17, r2 + 0.1 * rim_var));
    
    // spot
    
    
    // eyelash
        
    // pupil
    rim_var = fbm(8. * p);
    rim_var *= rim_var;
    col = mix(vec3(0.), col, smoothstep(0.015 + pupil_var * .75, 0.025 + pupil_var, r2 + 0.008 * rim_var));
    
    // spark
    vec3 N = normalize(vec3(p,sqrt(eye_r * eye_r - r2)));
    vec3 R = normalize(reflect(-rd, N));
    vec3 spark = texture(iChannel0, R).rgb;
    spark = pow(3.0 * spark, vec3(10.)) * 0.005;
    col += spark;
    
    // rim
    col = mix(col, vec3(0.), smoothstep(0.35, 0.48, r2));
    
    
    
    // bkg
    vec3 bkg_col = mix(vec3(1.0), vec3(0.4), smoothstep(0.8, 8.0, r2));
    col = mix(col, bkg_col, smoothstep(0.42, 0.5, r2));

    fragColor = vec4(col,1.);
}