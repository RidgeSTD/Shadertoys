//#define HAZEL_IRIS
#define SAPHIR_IRIS

#define PI 3.14159265359
#define PI2 1.57079632679

// https://www.shadertoy.com/view/4djSRW by David Hoskins
float hash12(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Four corners in 2D of a tile
    float a = hash12(i);
    float b = hash12(i + vec2(1., 0.));
    float c = hash12(i + vec2(0., 1.));
    float d = hash12(i + vec2(1., 1.));

    vec2 u = f * f * (3. - 2. * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.;
    v += noise(p) * .5	   ; p *= 2.01;
    v += noise(p) * .25   ; p *= 2.02;
    v += noise(p) * .125  ; p *= 2.03;
    v += noise(p) * .0625 ; p *= 2.04;
    v += noise(p) * .03125;
    return v / .96875;
}

// exponentialy increase and decrease between 0 and 1
// x follows sine wave
float damping_step(float edge, float x) {
    edge = clamp(edge, 0., 1.);
    float f = smoothstep(-edge, edge, sin(x));
    float loose = log(max(f, 1e-7)) * .15 + 1.;
    float tight = -log(max(1. - f, 1e-7)) * .15;
    f = step(0., cos(x)); // use derivative to determin convex direction
    float v = mix(tight, loose, f);
    v = clamp(v, 0., 1.);
    return v;
}

const float eye_r = 1.5;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = uv * 2. - 1.;
    p.x *= iResolution.x / iResolution.y;
    float time = iTime;
    
    vec3 ro = vec3(0, 0, 3.);
    vec3 target = vec3(0, 0, -1);
    vec3 right = normalize(cross(target, vec3(0., 1., 0.)));
    vec3 up = normalize(cross(right, target));
    right = normalize(cross(target, up));
	vec3 rd = normalize((p.x*right + p.y*up) + target);
    

    
    float r = length(p);
    float a = atan(p.y, p.x);
    float va = a;
    float f;
    
    float light_intensity = .1 + .6 * step(0., sin(time));
    // reaction delay
    const float REACT_TIME = .6 + PI;
    time -= REACT_TIME;
    float pupil_var = .2 + damping_step(.5, time) * .2;
    time += REACT_TIME;

    
    // iris texture
    vec3 col, inner_col, outter_col;
#ifdef HAZEL_IRIS
    va = fbm(vec2(20. * a, r));
   	outter_col = mix (vec3(.4, .15, .07), vec3(.35, .15, .02), fbm(vec2(2. * va, 20. * r)));
    outter_col = mix(vec3(.1, .06, .02), outter_col, fbm(vec2(20. * va, r)));
    inner_col = mix (vec3(.25, .15, .1), vec3(.45, .25, .02), fbm(vec2(1.5 * va, .5 * r)));
    inner_col = mix(vec3(.1, .06, .02), inner_col, fbm(vec2(5. * va, 2. * r)));
#endif
#ifdef SAPHIR_IRIS
    outter_col = mix (vec3(.1,.24,.7), vec3(.1,.5, 0.7), fbm(vec2(2. * va, 20. * r)));
    outter_col = mix(vec3(.3,.45,.7), outter_col, fbm(vec2(20. * va, r)));
    inner_col = mix (vec3(.18,.14,.7), vec3(.1,.5, .7), fbm(vec2(1.5 * va, .5 * r)));
    f = 1. - smoothstep(0., .4 + .8 * pupil_var, r);
    inner_col = mix(inner_col, vec3(.6, .8, .6), f);
    f = smoothstep(.3, 1., fbm(vec2(20. * a, 6. * r)));
    inner_col = mix(inner_col, vec3(.4,.6, 0.8), f);
#endif
    float rim_var = fbm(3. * p); // inner and outer iris edge
    rim_var *= rim_var;
    col = mix( inner_col, outter_col, smoothstep(.4, .55, r + .1 * rim_var));
    col *= min(light_intensity + .7, 1.);
    
    // spot
    f = smoothstep(.05, .25, fbm((20. - 3. * pupil_var / (r * r))* p));
    col = mix(vec3(.04), col, f);
    
    // pupil
    rim_var = .7 * fbm(p);
    rim_var *= rim_var;
    col = mix(vec3(0.), col, smoothstep(.015 + pupil_var * .9, .025 + pupil_var, r + .3 * rim_var));
    
    // spark
    if (r < eye_r) {
        vec3 N = normalize(vec3(p,sqrt(eye_r * eye_r - r * r)));
        vec3 R = normalize(reflect(rd, N));

        vec3 spark = texture(iChannel0, R).rgb;
        spark = vec3(spark.r + spark.g + spark.b) * 0.3;
        spark = pow(3. * spark, vec3(10.)) * .00002;
        col += clamp(spark, 0., 1.) * light_intensity;
    }
    
    // rim
    col = mix(col, vec3(0.), smoothstep(.65, .8, r));
    
    // bkg
    vec3 bkg_col = mix(vec3(1.), vec3(.4), smoothstep(.2, 4., r));
    col = mix(col, bkg_col, smoothstep(.72, .8, r));

    fragColor = vec4(col, 1.);
}