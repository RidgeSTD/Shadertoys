    // The Cornell Box - @h3r3
    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    //
    // Reproducing the famous Cornell Box through Raymarching, fake soft-shadows,
    // fake indirect lighting, ambient occlusion and antialiasing.
    // Reference data: http://www.graphics.cornell.edu/online/box/
    // Reference image: http://www.graphics.cornell.edu/online/box/box.jpg

    // --- Adapt from GLSL Sandbox
    #define time iTime

    // Set ANTIALIAS_ALWAYS to false if the animation is too slow
    #define ANTIALIAS_ALWAYS false
    #define ANTIALIAS_SAMPLES 4
    // #define ANIMATE_CAMERA

    #define DRAG_MULT 0.048

    #define PI 3.14159265359
    #define ZERO 1e-20
    #define EXPOSURE 34.
    #define GAMMA 2.1
    #define SOFT_SHADOWS_FACTOR 4.
    #define MAX_RAYMARCH_ITER 1024
    #define MAX_RAYMARCH_ITER_SHADOWS 16
    #define MIN_RAYMARCH_DELTA 0.0015

    #define GRADIENT_DELTA 0.0002
    #define OBJ_FLOOR 1.
    #define OBJ_CEILING 2.
    #define OBJ_BACKWALL 3.
    #define OBJ_LEFTWALL 4.
    #define OBJ_RIGHTWALL 5.
    #define OBJ_LIGHT 6.
    #define OBJ_WATER 7.
    #define OBJ_TALLBLOCK 8.

    #define WAVE_COMPLEXITY 12
    #define WAVE_NORMAL_COMPLEXITY 48
    #define WAVE_SIZE 50.
    #define WATER_DEPTH 100.

    #define WATER_BLUE_MIX .7

    // RGB wavelengths: 650nm, 510nm, 475nm
    const vec3 lightColor = vec3(16.86, 8.76 + 2., 3.2 + .5);
    const vec3 lightDiffuseColor = vec3(.78);
    const vec3 leftWallColor = vec3(.611, .0555, .062);
    const vec3 rightWallColor = vec3(.117, .4125, .115);
    const vec3 whiteWallColor = vec3(.7295, .7355, .729);
    const vec3 waterBlueColor = vec3(0.00, 0.52, 0.99);
    const vec3 cameraTarget = vec3(556, 548.8, 559.2) * .5;

    const vec3 lightBound = vec3(65, 0.05, 65);

    bool isThroughWater = false;

    float sdBox(vec3 p, vec3 b) {
        vec3 d = abs(p) - b;
        return min(max(d.x, max(d.y, d.z)), 0.) + length(max(d, 0.));
    }

    bool rayBoxIntersect(const vec3 ori, const vec3 dir, const vec3 b) {
        float tmin, tmax, tymin, tymax, tzmin, tzmax;
        vec3 invdir = 1. / dir;
        int sign[3];
        sign[0] = invdir.x < 0. ? 1 : 0;
        sign[1] = invdir.y < 0. ? 1 : 0;
        sign[2] = invdir.z < 0. ? 1 : 0;
        vec3 rightup = vec3(b.x * .5, b.y * .5, b.z * .5);
        vec3 bounds[2];
        bounds[0] = -rightup;
        bounds[1] = rightup;

        tmin = (bounds[sign[0]].x - ori.x) * invdir.x;
        tmax = (bounds[1 - sign[0]].x - ori.x) * invdir.x;
        tymin = (bounds[sign[1]].y - ori.y) * invdir.y;
        tymax = (bounds[1 - sign[1]].y - ori.y) * invdir.y;

        if ((tmin > tymax) || (tymin > tmax)) return false;
        if (tymin > tmin) tmin = tymin;
        if (tymax < tmax) tmax = tymax;

        tzmin = (bounds[sign[2]].z - ori.z) * invdir.z;
        tzmax = (bounds[1 - sign[2]].z - ori.z) * invdir.z;

        if ((tmin > tzmax) || (tzmin > tmax)) return false;
        if (tzmin > tmin) tmin = tzmin;
        if (tzmax < tmax) tmax = tzmax;

        return true;
    }

    vec3 rotateX(in vec3 p, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
    }

    vec3 rotateY(vec3 p, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    }

    vec3 rotateZ(vec3 p, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
    }

    // ==================  start of waves  ==================
    // ware related method modified from:
    // afl_ext: https://www.shadertoy.com/view/MdXyzX
    vec2 wavedx(vec2 position, vec2 direction, float speed, float frequency, float timeshift) {
        float x = dot(direction, position) * frequency + timeshift * speed;
        float wave = exp(sin(x) - 1.0);
        float dx = wave * cos(x);
        return vec2(wave, -dx);
    }

    float getWaves(vec2 position, int waveComplexity) {
        position /= 500.;
        float iter = 0.0;
        float phase = 6.0;
        float speed = 2.0;
        float weight = 1.0;
        float w = 0.0;
        float ws = 0.0;
        for (int i = 0; i < waveComplexity; i++) {
            vec2 p = vec2(sin(iter), cos(iter));
            vec2 res = wavedx(position, p, speed, phase, time);
            position += normalize(p) * res.y * weight * DRAG_MULT;
            w += res.x * weight;
            iter += 12.0;
            ws += weight;
            weight = mix(weight, 0.0, 0.2);
            phase *= 1.18;
            speed *= 1.07;
        }
        return w / ws * WAVE_SIZE;
    }

    float H = 0.0;
    vec3 normal(vec2 pos, float e) {
        vec2 ex = vec2(e, 0);
        H = getWaves(pos.xy * 0.1, WAVE_NORMAL_COMPLEXITY);
        vec3 a = vec3(pos.x, H, pos.y);
        return normalize(cross(
            normalize(a - vec3(pos.x - e, getWaves(pos.xy * 0.1 - ex.xy * 0.1, WAVE_NORMAL_COMPLEXITY), pos.y)),
            normalize(a - vec3(pos.x, getWaves(pos.xy * 0.1 + ex.yx * 0.1, WAVE_NORMAL_COMPLEXITY), pos.y + e))));
    }

    // ==================  end of waves  ==================

    vec2 map(vec3 p, vec3 ray_dir) {  //  ray_dir may be used for some optimizations
        vec2 res = vec2(OBJ_FLOOR, p.y);
        vec2 obj1 = vec2(OBJ_CEILING, 548.8 - p.y);
        if (obj1.y < res.y) res = obj1;
        vec2 obj2 = vec2(OBJ_BACKWALL, 559.2 - p.z);
        if (obj2.y < res.y) res = obj2;
        vec2 obj3 = vec2(OBJ_LEFTWALL, 556. - p.x);
        if (obj3.y < res.y) res = obj3;
        vec2 obj4 = vec2(OBJ_RIGHTWALL, p.x);
        if (obj4.y < res.y) res = obj4;
        vec2 obj5 = vec2(OBJ_LIGHT, sdBox(p + vec3(-278, -548.8, -292), lightBound));
        if (obj5.y < res.y) res = obj5;
        // vec2 obj6 = vec2(OBJ_WATER, abs(p.y - WATER_DEPTH - getWaves(vec2(p.x, max(0., p.z)), WAVE_COMPLEXITY)) + max(0.,
        // -p.z)); if (obj6.y < res.y) res = obj6;
        float waveY = WATER_DEPTH + getWaves(vec2(p.x, max(0., p.z)), WAVE_COMPLEXITY);
        vec2 obj6 = vec2(OBJ_WATER, abs(p.y - waveY) + max(0., -p.z));
        if (p.z >= 0. && p.y <= waveY) isThroughWater = true;
        if (obj6.y < res.y) res = obj6;
        return res;
    }

    vec2 map(vec3 p) { return map(p, vec3(0, 0, 0)); }

    vec3 gradientNormal(vec3 p) {
        return normalize(vec3(map(p + vec3(GRADIENT_DELTA, 0, 0)).y - map(p - vec3(GRADIENT_DELTA, 0, 0)).y,
                            map(p + vec3(0, GRADIENT_DELTA, 0)).y - map(p - vec3(0, GRADIENT_DELTA, 0)).y,
                            map(p + vec3(0, 0, GRADIENT_DELTA)).y - map(p - vec3(0, 0, GRADIENT_DELTA)).y));
    }

    float raymarch(vec3 ray_start, vec3 ray_dir, out float dist, out vec3 p, out int iterations) {
        dist = 0.0;
        float minStep = 0.005;
        vec2 mapRes;
        isThroughWater = false;
        for (int i = 1; i <= MAX_RAYMARCH_ITER; i++) {
            p = ray_start + ray_dir * dist;
            mapRes = map(p, ray_dir);
            if (mapRes.y < MIN_RAYMARCH_DELTA) {
                iterations = i;
                return mapRes.x;
            }
            dist += max(mapRes.y, minStep);
        }
        return -1.;
    }

    bool raymarch_to_light(vec3 ray_start, vec3 ray_dir, float maxDist, float maxY, out float dist, out vec3 p,
                        out int iterations, out float light_intensity) {
        dist = 0.;
        float minStep = 1.0;
        light_intensity = 1.0;
        float mapDist;
        for (int i = 1; i <= MAX_RAYMARCH_ITER_SHADOWS; i++) {
            p = ray_start + ray_dir * dist;
            // mapDist = mapBlocks(p, ray_dir).y;
            // if (mapDist < MIN_RAYMARCH_DELTA) {
            //    iterations = i;
            //    return true;
            //}
            light_intensity = min(light_intensity, SOFT_SHADOWS_FACTOR * mapDist / dist);
            dist += max(mapDist, minStep);
            if (dist >= maxDist || p.y > maxY) {
                break;
            }
        }
        return false;
    }

    vec3 cheap_light_reflect(vec3 ori, vec3 dir) {
        vec3 L = rayBoxIntersect(ori + vec3(-278, -548.8, -292), dir, lightBound) ? lightColor : vec3(0.);
        return L;
    }

    vec3 interpolateNormals(vec3 v0, vec3 v1, float x) {
        x = smoothstep(0., 1., x);
        return normalize(vec3(mix(v0.x, v1.x, x), mix(v0.y, v1.y, x), mix(v0.z, v1.z, x)));
    }

    float ambientOcclusion(vec3 p, vec3 n) {
        float step = 8.;
        float ao = 0.;
        float dist;
        for (int i = 1; i <= 3; i++) {
            dist = step * float(i);
            ao += max(0., (dist - map(p + n * dist).y) / dist);
        }
        return 1. - ao * 0.1;
    }

    vec3 render(vec3 ray_start, vec3 ray_dir) {
        float dist;
        vec3 p;
        int iterations;
        isThroughWater = false;
        float objectID = raymarch(ray_start, ray_dir, dist, p, iterations);
        bool _waterInte = isThroughWater;
        isThroughWater = false;

        vec3 color = vec3(0);
        if (p.z >= 0.) {
            if (objectID == OBJ_WATER) {
                // refraction
                vec3 N = normal(p.xz, 0.001, WAVE_SIZE);
                vec2 velocity = N.xz * (1.0 - N.y);
                N = mix(vec3(0.0, 1.0, 0.0), N, 1.0 / (dist * dist * 0.01 + 1.0));
                // here the eta is 1.5, hence ((n1-n2)/(n1+n2))^2=0.04
                float fresnel =
                    (0.04 + (1.0 - 0.04) * (pow(1.0 - max(0.0, dot(-N, ray_dir)), 5.0)));  // Schlick's approximation
                vec3 R = reflect(ray_dir, N);
                vec3 T = refract(ray_dir, N, .66666667);
                vec3 refractColor = vec3(0);
                vec3 newOri = vec3(p.x, p.y - 0.6, p.z);

                if (length(R) > ZERO) {
                    R = normalize(R);
                    int newIterations;
                    objectID = raymarch(newOri, T, dist, p, newIterations);
                    if (objectID == OBJ_FLOOR)
                        refractColor = whiteWallColor;
                    else if (objectID == OBJ_CEILING)
                        refractColor = whiteWallColor;
                    else if (objectID == OBJ_BACKWALL)
                        refractColor = whiteWallColor;
                    else if (objectID == OBJ_LEFTWALL)
                        refractColor = leftWallColor;
                    else if (objectID == OBJ_RIGHTWALL)
                        refractColor = rightWallColor;
                    else if (objectID == OBJ_LIGHT)
                        refractColor = lightDiffuseColor;
                    else if (objectID == OBJ_TALLBLOCK)
                        refractColor = whiteWallColor;
                    // debug: else refractColor = vec3(1,0,0);
                    refractColor = mix(refractColor, waterBlueColor, WATER_BLUE_MIX);
                }

                color = fresnel * cheap_light_reflect(newOri, R) + (1. - fresnel) * refractColor;
            } else {
                if (objectID == OBJ_FLOOR)
                    color = whiteWallColor;
                else if (objectID == OBJ_CEILING)
                    color = whiteWallColor;
                else if (objectID == OBJ_BACKWALL)
                    color = whiteWallColor;
                else if (objectID == OBJ_LEFTWALL)
                    color = leftWallColor;
                else if (objectID == OBJ_RIGHTWALL)
                    color = rightWallColor;
                else if (objectID == OBJ_LIGHT)
                    color = lightDiffuseColor;
                else if (objectID == OBJ_TALLBLOCK)
                    color = whiteWallColor;
                vec3 pFrontWall = ray_start - ray_dir * ray_start.z;
                if (_waterInte) color = mix(color, waterBlueColor, WATER_BLUE_MIX);
            }

            if (objectID == OBJ_LIGHT) {
                color *= lightColor;
            } else {
                float lightSize = 25.;
                vec3 lightPos = vec3(278, 548.8 - 50., 292 - 50);
                if (objectID == OBJ_CEILING) {
                    lightPos.y -= 550.;
                }

                lightPos.x = max(lightPos.x - lightSize, min(lightPos.x + lightSize, p.x));
                lightPos.y = max(lightPos.y - lightSize, min(lightPos.y + lightSize, p.y));
                vec3 n = gradientNormal(p);

                vec3 l = normalize(lightPos - p);
                float lightDistance = length(lightPos - p);
                float atten = ((1. / lightDistance) * .5) + ((1. / (lightDistance * lightDistance)) * .5);

                vec3 lightPos_shadows = lightPos + vec3(0, 140, -50);
                vec3 l_shadows = normalize(lightPos_shadows - p);
                float dist;
                vec3 op;
                int iterations;
                float l_intensity;
                bool res =
                    raymarch_to_light(p + n * .11, l_shadows, lightDistance, 400., dist, op, iterations, l_intensity);

                if (res && objectID != OBJ_CEILING) l_intensity = 0.;
                l_intensity = max(l_intensity, .25);
                vec3 c1 = color * max(0., dot(n, l)) * lightColor * l_intensity * atten;
                c1 = color * lightColor * atten;

                color = color * .0006 + c1;

                // Ambient occlusion
                float ao = ambientOcclusion(p, n);
                color *= ao;
            }
        }
        return color;
    }

    vec3 rotateCamera(vec3 ray_start, vec3 ray_dir) {
        ray_dir.x = -ray_dir.x;  // Flip the x coordinate to match the scene data
        vec3 target = normalize(cameraTarget - ray_start);
        float angY = atan(target.z, target.x);
        ray_dir = rotateY(ray_dir, PI / 2. - angY);
        float angX = atan(target.y, target.z);
        ray_dir = rotateX(ray_dir, -angX);
    #ifdef ANIMATE_CAMERA
        float angZ = smoothstep(0., 1., (time - 5.) * .1) * sin(time * 1.1 + .77) * .05;
        ray_dir = rotateZ(ray_dir, angZ);
    #endif
        return ray_dir;
    }

    vec3 moveCamera(vec3 ray_start) {
        ray_start += vec3(278, 273, -800);
    #ifdef ANIMATE_CAMERA
        vec3 ray_start_a = ray_start + vec3(cos(time * 0.8) * 180., cos(time * 0.9) * 180., (cos(time * .3) + 1.) * 390.);
        return mix(ray_start, ray_start_a, smoothstep(0., 1., (time - 5.) * .1));
    #else
        return ray_start;
    #endif
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 resolution = iResolution.xy;
        vec2 mouse = min(iMouse.xy / iResolution.xy, vec2(1));

        vec3 ray_start = vec3(0, 0, -1.4);
        vec3 color = vec3(0);
        if (ANTIALIAS_ALWAYS || time < 5.) {
            // ANTIALIAS
            float d_ang = 2. * PI / float(ANTIALIAS_SAMPLES);
            float ang = d_ang * .333;
            float r = .4;
            for (int i = 0; i < ANTIALIAS_SAMPLES; i++) {
                vec2 position = vec2((fragCoord.x + cos(ang) * r - resolution.x * .5) / resolution.y,
                                    (fragCoord.y + sin(ang) * r - resolution.y * .5) / resolution.y);
                vec3 ray_s = moveCamera(ray_start);
                vec3 ray_dir = rotateCamera(ray_s, normalize(vec3(position, 0) - ray_start));
                color += render(ray_s, ray_dir);
                ang += d_ang;
            }
            color /= float(ANTIALIAS_SAMPLES);
        } else {
            // NO ANTIALIAS
            vec2 position =
                vec2((fragCoord.x - resolution.x * .5) / resolution.y, (fragCoord.y - resolution.y * .5) / resolution.y);
            vec3 ray_s = moveCamera(ray_start);
            vec3 ray_dir = rotateCamera(ray_s, normalize(vec3(position, 0) - ray_start));
            color += render(ray_s, ray_dir);
        }

        color *= EXPOSURE;
        color = pow(color, vec3(1. / GAMMA));
        fragColor = vec4(color, 1);
    }