// "ShaderToy Tutorial - Ray Marching Primitives"
// by Martijn Steinrucken aka BigWings/CountFrolic - 2019
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//
// This shader is part of a tutorial on YouTube
// https://youtu.be/Ff0jJyyiVyw

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .001

float dot2(in vec2 v) { return dot(v, v); }
float dot2(in vec3 v) { return dot(v, v); }

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// iq starts
float sdCylinder(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float baba = dot(ba, ba);
    float paba = dot(pa, ba);

    float x = length(pa * baba - ba * paba) - r * baba;
    float y = abs(paba - baba * 0.5) - baba * 0.5;
    float x2 = x * x;
    float y2 = y * y * baba;
    float d = (max(x, y) < 0.0) ? -min(x2, y2) : (((x > 0.0) ? x2 : 0.0) + ((y > 0.0) ? y2 : 0.0));
    return sign(d) * sqrt(abs(d)) / baba;
}

float sdRoundCone(in vec3 p, in float r1, float r2, float h) {
    vec2 q = vec2(length(p.xz), p.y);

    float b = (r1 - r2) / h;
    float a = sqrt(1.0 - b * b);
    float k = dot(q, vec2(-b, a));

    if (k < 0.0) return length(q) - r1;
    if (k > a * h) return length(q - vec2(0.0, h)) - r2;

    return dot(q, vec2(a, b)) - r1;
}

float sdCappedCone(in vec3 p, in float h, in float r1, in float r2) {
    vec2 q = vec2(length(p.xz), p.y);

    vec2 k1 = vec2(r2, h);
    vec2 k2 = vec2(r2 - r1, 2.0 * h);
    vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
    vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot2(k2), 0.0, 1.0);
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s * sqrt(min(dot2(ca), dot2(cb)));
}

// !iq

float dSphere(vec3 p, float r) { return length(p) - r; }

float sdObj(in vec3 p, in float r1, float r2, float h) {
    vec2 q = vec2(length(p.xz), p.y);
    return 0.;
}

float sdSphere(in vec3 p, in float r) { return length(p) - r; }

float GetDist(vec3 p) {
    float t = iTime;

    float h = 1.;
    vec3 pos = vec3(0, 1.5, 1);
    float rT = 1.5;
    float rT2 = rT * rT;
    float rB = 2.;
    float d;

    float topRatio = 2.;
    float botRatio = 4.;
    float dcc = sdCappedCone(p - pos, h, rB, rT);

    // top sphere
    float rsTop = topRatio * h;
    float rsTop2 = rsTop * rsTop;
    vec3 sTopPos = vec3(pos.x, pos.y + h - sqrt(rsTop2 - rT2), pos.z);
    float dsTop = sdSphere(p - sTopPos, rsTop);
    dsTop = max(dsTop, -p.y + pos.y + h);
    d = min(dcc, dsTop);

    // top exit
    float rC = 0.8 * h;
    float hC = rsTop - sqrt(rsTop2 - rC * rC);
    vec3 cPos = sTopPos + vec3(0, rsTop, 0);
    float dcTop = sdCylinder(p - cPos, vec3(0, -hC, 0), vec3(0, hC * .1, 0), rC);
    d = min(d, dcTop);

    // sind window
    rC = 0.4 * h;
    hC = 0.05 * h;
    cPos = pos + vec3(0, 0, (rB - rT) / 2.);
    cPos = pos + vec3(0, 0, rT + (rB - rT) / 2.);
    float k = (rB - rT) / h;
    float dWindow = sdCylinder(p - cPos, vec3(0, -hC * k, -hC / k), vec3(0, hC * k, hC / k), rC);
    d = min(d, dWindow);

    // bottom sphere
    float rsBot = botRatio * h;
    float dsBot = sdSphere(p - vec3(pos.x, pos.y - h + sqrt(rsBot * rsBot - rB * rB), pos.z), rsBot);
    dsBot = max(dsBot, p.y - pos.y + h);
    d = min(d, dsBot);

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
    float d = GetDist(p);
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(GetDist(p - e.xyy), GetDist(p - e.yxy), GetDist(p - e.yyx));

    return normalize(n);
}

float GetLight(vec3 p) {
    vec3 lightPos = vec3(3, 5, 4);
    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p);

    float dif = clamp(dot(n, l) * .5 + .5, 0., 1.);
    float d = RayMarch(p + n * SURF_DIST * 2., l);
    if (p.y < .01 && d < length(lightPos - p)) dif *= .5;

    return dif;
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

    vec3 ro = vec3(0, 4, -5);
    ro.yz *= Rot(-m.y + .4);
    ro.xz *= Rot(iTime * .2 - m.x * 6.2831);

    vec3 rd = R(uv, ro, vec3(0, 0, 0), .7);

    float d = RayMarch(ro, rd);

    if (d < MAX_DIST) {
        vec3 p = ro + rd * d;

        float dif = GetLight(p);
        col = vec3(dif);
    }

    col = pow(col, vec3(.4545));  // gamma correction

    fragColor = vec4(col, 1.0);
}