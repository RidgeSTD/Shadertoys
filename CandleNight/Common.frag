#define N 21
#define WICK_X 0.
#define WICK_Y -0.2
#define CANDLE_HALF_WIDTH 0.2

const vec2 WICK = vec2(0., -0.2);

float bilerp(float v11, float v12, float v21, float v22, float w1, float w2) {
    w1 = clamp(w1, 0., 1.);
    w2 = clamp(w2, 0., 1.);
    return mix(mix(v11, v12, w2), mix(v21, v22, w2), w1);
}

vec2 bilerp(vec2 v11, vec2 v12, vec2 v21, vec2 v22, vec2 w1, vec2 w2) {
    w1 = clamp(w1, 0., 1.);
    w2 = clamp(w2, 0., 1.);
    return mix(mix(v11, v12, w2), mix(v21, v22, w2), w1);
}

vec3 bilerp(vec3 v11, vec3 v12, vec3 v21, vec3 v22, vec3 w1, vec3 w2) {
    w1 = clamp(w1, 0., 1.);
    w2 = clamp(w2, 0., 1.);
    return mix(mix(v11, v12, w2), mix(v21, v22, w2), w1);
}