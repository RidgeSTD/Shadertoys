#define N 21
// we assume grid scale to be one
#define HALF_RDX .5
#define CLICK_INTERVAL 1.
#define ANIM_DUR 10.
#define LIT_DUR 3.

// smoke behaviour
#define AMBIENT_TEMP 26.
#define WICK_TEMP 300.
#define TEMP_DIFFUSE 0.99
#define DENS_DIFFUSE 0.99
#define VELO_DIFFUSE 0.99
#define VISCOCITY 0.2
#define SMOKE_GRAVITY_FACT 0.2
#define SMOKE_TEMP_FACT 0.3

// candle look
#define WICK_X 0.
#define WICK_Y -0.6
#define CANDLE_HALF_WIDTH 0.2
#define WICK_LEN 0.07

#define SAT(x) clamp(x, 0., 1.)
#define COOLING(x) exp(-pow(x, .3))

const vec2 WICK_POS = vec2(WICK_X, WICK_Y);
const vec3 FLAME_COL = vec3(.99, .6, .35);
const vec3 CANDLE_COL = vec3(0.92, 0.02, 0.21);
const vec3 BG_COL = vec3(.99, .6, .35);
const vec4 DIFFUSE_VEC = vec4(VELO_DIFFUSE, VELO_DIFFUSE, TEMP_DIFFUSE, DENS_DIFFUSE);
const float TEMP_DIFF = WICK_TEMP - AMBIENT_TEMP;

float bilerp(float v11, float v12, float v21, float v22, float w1, float w2) {
    w1 = SAT(w1);
    w2 = SAT(w2);
    return mix(mix(v11, v12, w2), mix(v21, v22, w2), w1);
}

vec2 bilerp(vec2 v11, vec2 v12, vec2 v21, vec2 v22, vec2 w1, vec2 w2) {
    w1 = SAT(w1);
    w2 = SAT(w2);
    return mix(mix(v11, v12, w2), mix(v21, v22, w2), w1);
}

vec3 bilerp(vec3 v11, vec3 v12, vec3 v21, vec3 v22, vec3 w1, vec3 w2) {
    w1 = SAT(w1);
    w2 = SAT(w2);
    return mix(mix(v11, v12, w2), mix(v21, v22, w2), w1);
}

vec2 xyGrad(sampler2D s, vec2 coord, vec2 resXY) {
    float vL = texture(s, (coord - vec2(1, 0)) / resXY).x;
    float vR = texture(s, (coord + vec2(1, 0)) / resXY).x;
    float vB = texture(s, (coord - vec2(0, 1)) / resXY).y;
    float vT = texture(s, (coord + vec2(0, 1)) / resXY).y;

    return HALF_RDX * vec2(vR - vL, vT - vB);
}

float hash2(vec2 p) {
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float blink(float t) {
    return 1. - pow(2. + sin(t), -5.);
}