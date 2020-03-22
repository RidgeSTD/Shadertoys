// The MIT License
// Copyright © 2020 Ridge/winlandiano
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
// notice and this permission notice shall be included in all copies or substantial portions of the Software. THE
// SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// A simple PBR shader with environment map. Forward shading, directional+point light sources. Unity-style approximation.
// GGX: Walter et al.
// Fresnel term: Schlick C.
// Visibility/geometry term: Smith shadow-masking
// Distribution term: Trowbridge-Reitz

#define SPHERE_N 1
#define LIGHT_N 2
#define AMBIENT_WEIGHT 0.3
#define SPEED 0.5

#define SPHERE_TYPE 1

#define DIRECTIONAL_LIGHT_TYPE 51
#define POINT_LIGHT_TYPE 52

#define INF 10000000000.0f
#define PI 3.141592653589793
#define TWOPI 6.283185307179586

#define saturate(x) clamp(x, 0., 1.)

// ----------------  optional function macros  ----------------
#define CAMERA_ANIMATION
#define LIGHT_ANIMATION
// ----------------  optional function ends  ----------------

struct Ray {
    vec3 origin;
    vec3 direction;
    float t_max;
    float t_min;
};

struct Camera {
    vec3 position;
    float fov;
    vec3 target;
    vec3 up;
};

mat4 lookAt(Camera c) {
    vec4 D = vec4(normalize(c.target - c.position), 0);
    vec4 U = vec4(c.up, 0);
    vec4 R = vec4(cross(D.xyz, U.xyz), 0);
    vec4 P = vec4(c.position, 1);
    mat4 m1 = mat4( vec4(R.x, U.x, D.x, 0), 
                    vec4(R.y, U.y, D.y, 0),
                    vec4(R.z, U.z, D.z, 0),
                    vec4(0, 0, 0, 1));
    mat4 m2 = mat4( vec4(1, 0, 0, 0),
                    vec4(0, 1, 0, 0),
                    vec4(0, 0, 1, 0),
                    vec4(-P.xyz, 1));
    mat4 newView = m1 * m2;
    return newView;
}

struct LightSource {
    vec3 position;
    float intensity;
    vec3 color;
    int type;
};

struct Sphere {
    float radius;
    vec3 center;
    int type;
};

struct Intersection {
    vec4 P;
    vec3 N;
    vec3 V;
    vec4 baseColor;
    float metallic;
    float roughness;
};

float SphereIntersect(Ray r, Sphere s) {
    vec3 L = s.center - r.origin;
    float d = length(L);
    float d2 = d * d;
    float cos_theta = saturate(dot(normalize(L), r.direction));
    float cos_theta2 = cos_theta * cos_theta;
    if (cos_theta <= 0.) {
        return INF;
    }
    float sin_theta2 = 1. - cos_theta2;
    float r2 = s.radius * s.radius;
    float intersect_half2 = r2 - d2 * sin_theta2;
    if (intersect_half2 < 0.) {
        return INF;
    }
    float center_project_dist = d * cos_theta;
    float intersect_half = sqrt(intersect_half2);
    float t0 = center_project_dist - intersect_half;
    if (t0 < 0.) {
        return center_project_dist + intersect_half;
    } else {
        return t0;
    }
}

vec2 Polar(vec3 norm) {
    vec2 res;
    res.y = (norm.y + 1.) / 2.;
    res.x = atan(norm.z, norm.x) / TWOPI;
    return res.xy;
}

vec2 PolarWrap(vec3 norm) {
    vec2 res = Polar(norm);
    res.x = abs(res.x - 0.5) * 2.;
    return res;
}

struct GlazeMaterial {
    float f0, roughness;
};

const GlazeMaterial BallMaterial = GlazeMaterial(0.2, 0.4);

Sphere spheres[SPHERE_N];
LightSource lights[LIGHT_N];
Camera camera;
mat4 View;

void SetupScene(float frame) {
    spheres[0] = Sphere(0.3, vec3(0, 0, 0), SPHERE_TYPE);
    lights[0] = LightSource(normalize(vec3(1, -1, 1)), 1., vec3(1, 1, 1), DIRECTIONAL_LIGHT_TYPE);
#ifdef LIGHT_ANIMATION
    lights[1] = LightSource(vec3(2. * cos(5. * frame), 2. * sin(5. * frame), 0.), 1., vec3(1, 1, 1), POINT_LIGHT_TYPE);
#else
    lights[1] = LightSource(vec3(-2., 2., 0.), 1., vec3(1, 1, 1), POINT_LIGHT_TYPE);
#endif
#ifdef CAMERA_ANIMATION
    camera = Camera(1.5 * vec3(-cos(frame), 0., 1.5 * sin(frame)), 45., vec3(0, 0, 0), normalize(vec3(0, 1, 0)));
#else
    camera = Camera(vec3(-1., 0., 1.), 45., vec3(0, 0, 0), normalize(vec3(0, 1, 0)));
#endif
    View = lookAt(camera);
}

// ----------------  shading technics  ----------------

vec3 Lambertian(Intersection i, LightSource light) {
    vec3 L;
    float intensity = light.intensity;
    if (light.type == POINT_LIGHT_TYPE) {
        L = light.position - i.P.xyz;
        float d = length(L);
        L = normalize(L);
        intensity /= min(d * d, 1.);
    } else {
        L = -normalize(light.position);
    }
    return i.baseColor.xyz * i.roughness * light.color * intensity * saturate(dot(i.N, L));
           // + AMBIENT_WEIGHT * texture(iChannel2, i.N).xyz;
}

vec3 PerfectReflection(Intersection i, LightSource light) {
    vec3 R = reflect(-i.V, i.N);
    return texture(iChannel0, R).xyz;
}

// Fresnel term, Schlick's approximation
// Schlick C. An inexpensive BRDF model for physically‐based rendering[C]//Computer graphics forum. Edinburgh, UK:
// Blackwell Science Ltd, 1994, 13(3): 233-246.
float F_Schlick(vec3 L, vec3 H_r, float f0) { return f0 + (1. - f0) * pow((1. - saturate(dot(L, H_r))), 5.); }

// Bidirectional shadowing-masking function
// Used Smith G Approximate, according to Walter et al.
// Ref: http://jcgt.org/published/0003/02/03/paper.pdf
float G_GgxSmith(float LdotN, float VdotN, float g) {
    float g2 = g * g;
    float lambdaV = LdotN * sqrt((-VdotN * g2 + VdotN) * VdotN + g2);
    float lambdaL = VdotN * sqrt((-LdotN * g2 + LdotN) * LdotN + g2);
    // Simplify visibility term: (2.0f * NdotL * NdotV) /  ((4.0f * NdotL * NdotV) * (lambda_v + lambda_l + 1e-7f));
    return 0.5 / (lambdaV + lambdaL + 1e-7f);
}

// Microfacet distribution function
// Trowbridge-Reitz GGX function
float D_GGX_TR(vec3 N, vec3 H, float d) {
    float d2 = d * d;
    float dotNH = saturate(dot(N, H));
    float denomenator = dotNH * dotNH * (d2 - 1.) + 1.;
    return d2 / (PI * denomenator * denomenator + 1e-7);
}

vec3 GGX(Intersection i, LightSource light) {
    vec3 L;
    float intensity = light.intensity;
    if (light.type == POINT_LIGHT_TYPE) {
        L = light.position - i.P.xyz;
        float d = length(L);
        L = normalize(L);
        intensity /= min(d * d, 1.);
    } else {
        L = -normalize(light.position);
    }
    vec3 H = normalize(i.V + L);
    float LdotN = saturate(dot(L, i.N));
    float VdotN = saturate(dot(i.V, i.N));

    float perceptualRoughness = i.roughness * i.roughness;
    float roughness = max(perceptualRoughness, 0.002);
    float F = F_Schlick(L, H, i.metallic);
    float G = G_GgxSmith(LdotN, VdotN, roughness);
    float _d = roughness * roughness;
    float D = D_GGX_TR(i.N, H, _d);
    float ggx = F * G * D;

    // lambert model as diffuse part
    vec3 diffuseLightColor = Lambertian(i, light);

    vec3 HEnv = normalize(i.N + i.V);
    float FEnv = F_Schlick(i.N, HEnv, i.metallic);
    return diffuseLightColor
        + texture(iChannel0, i.N).xyz * FEnv * AMBIENT_WEIGHT// * max(0., dot(i.N, L))
        + light.color * intensity * ggx;
}

// ----------------  shading technics ends  ----------------

vec3 Render(Ray r) {
    vec3 col = vec3(0);

    highp float t_min = INF;
    int idx = -1;
    for (int i = 0; i < SPHERE_N; i++) {
        float t = SphereIntersect(r, spheres[i]);
        if (t < t_min) {
            t_min = t;
            idx = i;
        }
    }

    if (t_min < INF) {
        for (int i = 0; i < LIGHT_N; i++) {
            LightSource light = lights[i];
            vec4 P = vec4(r.origin + r.direction * t_min, 1.);
            vec3 N = normalize(P.xyz - spheres[idx].center);
            Intersection intersection = Intersection(P, N, -r.direction, texture(iChannel1, PolarWrap(N)),
                                                     BallMaterial.f0, BallMaterial.roughness);

            col += GGX(intersection, light);
        }
    } else {
        col = texture(iChannel0, r.direction).xyz;
    }
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

    vec3 col = vec3(uv, 0);

    SetupScene(iTime * SPEED);

    // place screen infront of camera, transform to world space
    Ray r = Ray(camera.position, normalize(inverse(View) * vec4(uv, 1, 0)).xyz, 0., 999.);

    col = Render(r);

    fragColor = vec4(col, 1.);
}