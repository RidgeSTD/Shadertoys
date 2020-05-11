#define N 21
#define WICK_X 0.
#define WICK_Y -0.6
#define CANDLE_HALF_WIDTH 0.2
#define FLAME_HEIGHT 0.5

#define SAT(x) clamp(x, 0., 1.)

const vec2 WICK_POS = vec2(WICK_X, WICK_Y);
const vec3 FLAME_COL = vec3(.99, .6, .35);
const vec3 CANDLE_COL = vec3(0.92, 0.02, 0.21);

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