#define N 21
#define WICK_X 0.
#define WICK_Y -0.6
#define CLICK_INTERVAL 1.

// smoke behaviour
#define AMBIENT_TEMP 26.
#define WICK_TEMP 159.
#define TEMP_DIFFUSE 0.99
#define DENS_DIFFUSE 0.98
#define VELO_DIFFUSE 0.99

// candle look
#define CANDLE_HALF_WIDTH 0.2

#define SAT(x) clamp(x, 0., 1.)
#define COOLING(x) exp(-pow(x, .3))

const vec2 WICK_POS = vec2(WICK_X, WICK_Y);
const vec3 FLAME_COL = vec3(.99, .6, .35);
const vec3 CANDLE_COL = vec3(0.92, 0.02, 0.21);
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