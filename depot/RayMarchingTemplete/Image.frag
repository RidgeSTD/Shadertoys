#define MAX_STEPS 1000
#define MAX_DIST 100.
#define SURF_DIST .001
#define CENTER vec3(0)


float GetDist(vec3 p) {
    vec3 pos = vec3(0, 0, 5);
    float b = 2.;

    float d;
    d = sdTorus((p - pos).xzy, vec2(2, .2));
    d = sdBox(p - pos, vec3(b));
    d = sdCappedTorus(p - pos, vec2(0.866025,-0.5), 1.95, 0.25);
    d = sdSphere(p - pos, b);
    
    return d;
}

float RayMarch(vec3 ro, vec3 rd) {
    float dO = 0.;

    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = abs(GetDist(p));
        dO += dS;
        if (dO > MAX_DIST || dS < SURF_DIST) break;
    }

    return dO;
}

vec3 GetNormal(vec3 p) {
#if 0
    float d = GetDist(p);
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(GetDist(p - e.xyy), GetDist(p - e.yxy), GetDist(p - e.yyx));

    return normalize(n);
#else
    vec3 n = vec3(0.0);
    for( int i=0; i<4; i++ )
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*GetDist(p+0.0005*e);
      //if( n.x+n.y+n.z>100.0 ) break;
    }
    return normalize(n);
#endif
}

float Phong(vec3 p, vec3 lightPos, vec3 l, vec3 n) {
    float dif = clamp(dot(n, l) * .5 + .5, 0., 1.);
    
    return dif;
}


float GetLight(vec3 p) {
    vec3 lightPos = vec3(3, 5, -4);
    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p);

    return Phong(p, lightPos, l, n);
}

vec3 R(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l - p), r = normalize(cross(vec3(0, 1, 0), f)), u = cross(f, r), c = p + f * z,
         i = c + uv.x * r + uv.y * u, d = normalize(i - p);
    return d;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;
    vec2 m = iMouse.xy / iResolution.xy;

    vec3 col = vec3(0);

    vec3 ro = vec3(0, 0, -5);
    ro.yz *= Rot(1. -m.y * 2.);
    ro.xz *= Rot(2. - m.x * 4.);

    vec3 rd = R(uv, ro, CENTER, .7);

    float d = RayMarch(ro, rd);

    if (d < MAX_DIST) {
        vec3 p = ro + rd * d;

        float dif = GetLight(p);
        col = GetNormal(p);
        col = vec3(dif);
    }

    //col = pow(col, vec3(.4545));  // gamma correction

    fragColor = vec4(col, 1.0);
}