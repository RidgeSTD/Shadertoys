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

// https://www.unrealengine.com/en-US/blog/physically-based-shading-on-mobile
vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	const vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);
	const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
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
float damping_step(float edge, float x) {
    edge = clamp(edge, 0., 1.);
    float f = smoothstep(-edge, edge, sin(x));
    float loose = log(max(f, 1e-7)) * .15 + 1.;
    float tight = -log(max(1. - f, 1e-7)) * .15;
    f = step(0., cos(x));
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
    const float REACT_TIME = .6;
    time -= REACT_TIME;
    float pupil_var = .2 + damping_step(.5, time) * .2;
    time += REACT_TIME;

    
    // iris texture
    vec3 col, inner_col, outter_col;
#ifdef HAZEL_IRIS
    va = fbm(vec2(20. * a, r));
   	outter_col = mix (vec3(.45, .25, .1), vec3(.6, .4, .1), fbm(vec2(2. * va, 20. * r)));
    outter_col = mix(vec3(.35, .31, .25), outter_col, fbm(vec2(20. * va, r)));
    inner_col = mix (vec3(.45, .25, .1), vec3(.6, .4, .1), fbm(vec2(1.5 * va, .5 * r)));
    inner_col = mix(vec3(.35, .31, .25), inner_col, fbm(vec2(5. * va, 2. * r)));
#endif
#ifdef SAPHIR_IRIS
    outter_col = mix (vec3(.38,.34,.7), vec3(.7,.9,.92), fbm(vec2(2. * va, 20. * r)));
    outter_col = mix(vec3(.6,.8,1.), outter_col, fbm(vec2(20. * va, r)));
    inner_col = mix (vec3(.38, .34, .7), vec3(.7,.9,.92), fbm(vec2(1.5 * va, .5 * r)));
    f = 1. - smoothstep(0., .4 + .8 * pupil_var, r);
    inner_col = mix(inner_col, vec3(.8, .9, .9), f);
    f = smoothstep(.3, 1., fbm(vec2(20. * a, 6. * r)));
    inner_col = mix(inner_col, vec3(.6,.8, 1.), f);
#endif
    float rim_var = fbm(3. * p); // inner and outer iris edge
    rim_var *= rim_var;
    col = mix( inner_col, outter_col, smoothstep(.4, .55, r + .1 * rim_var));
    col *= min(light_intensity + .7, 1.);
    
    // spot
    f = smoothstep(.05, .25, fbm(20. * p));
    col = mix(vec3(.2), col, f);
    
    // eyelash
        
    // pupil
    rim_var = .7 * fbm(p);
    rim_var *= rim_var;
    col = mix(vec3(0.), col, smoothstep(.015 + pupil_var * .9, .025 + pupil_var, r + .3 * rim_var));
    
    // spark
    if (r < eye_r) {
        vec3 N = normalize(vec3(p,sqrt(eye_r * eye_r - r * r)));
        vec3 R = normalize(reflect(rd, N));
        f = dot(N, rd);
        float fresnel = pow(1. - clamp(0., 1., f), 5.);

        vec3 spark = texture(iChannel0, R).rgb;
        spark = vec3(spark.r + spark.g + spark.b) * 0.3;
        spark = pow(3. * spark, vec3(10.)) * .00005;
        col += clamp(spark, 0., 1.) * light_intensity;
    }
    
    // rim
    col = mix(col, vec3(0.), smoothstep(.65, .8, r));
    
    
    
    // bkg
    vec3 bkg_col = mix(vec3(1.), vec3(.4), smoothstep(.8, 8., r));
    col = mix(col, bkg_col, smoothstep(.72, .8, r));

    fragColor = vec4(col,1.);
}