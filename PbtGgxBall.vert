#define SPHERE_N 1
#define LIGHT_N 1
#define BACKGROUND vec3(0, 0.17, 0.19)

#define SPHERE_TYPE 1

#define DIRECTIONAL_LIGHT_TYPE 51

#define INF 10000000000.0f
#define PI 3.141592653589793
#define TWOPI 6.283185307179586

struct Ray {
    vec3 origin;
    vec3 direction;
    float t_max;
    float t_min;
};

struct Camera {
    vec3 position;

    // TODO direction, fov etc...
};

struct LightSource {
    vec3 position;
    float intensity;
    vec3 color;
    int type;
};

struct Sphere {
    float radius;
    vec3 center;
    vec3 emission;
    vec3 color;
    float roughness;
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
    float cos_theta = dot(normalize(L), r.direction);
    float cos_theta2 = cos_theta * cos_theta;
    if (cos_theta <= 0.0) {
        return INF;
    }
    float sin_theta2 = 1.0 - cos_theta2;
    float r2 = s.radius * s.radius;
    float intersect_half2 = r2 - d2 * sin_theta2;
    if (intersect_half2 < 0.0) {
        return INF;
    }
    float center_project_dist = d * cos_theta;
    float intersect_half = sqrt(intersect_half2);
    float t0 = center_project_dist - intersect_half;
    if (t0 < 0.0) {
        return center_project_dist + intersect_half;
    } else {
        return t0;
    }
}

vec2 Polar(vec3 norm) {
    vec2 res;
    res.y = (norm.y + 1.0) / 2.0;
    res.x = atan(norm.z, norm.x) / TWOPI;
    return res.xy;
}

vec2 PolarWrap(vec3 norm) {
    vec2 res = Polar(norm);
    res.x = abs(res.x - 0.5) * 2.0;
    return res;
}

Sphere spheres[SPHERE_N];
LightSource lights[LIGHT_N];
Camera camera;

void SetupScene() {
    spheres[0] = Sphere(0.3, vec3(0, 0, 1), vec3(1, 1, 1), vec3(1, 0, 0), 0.5, SPHERE_TYPE);
    lights[0] = LightSource(normalize(vec3(0, -1, 0)), 0.3, vec3(1, 1, 1), DIRECTIONAL_LIGHT_TYPE);
    camera = Camera(vec3(0, 0, 0));
}

// ----------------  shading technics  ----------------

vec3 Lambertian(Intersection i, LightSource light) {
    return clamp(light.color * light.intensity * dot(i.N, -light.position), 0.0, 1.0);
}

vec3 PerfectReflection(Intersection i, LightSource light) {
    vec3 R = reflect(-i.V, i.N);
    return texture(iChannel1, R).xyz;
}

// Fresnel term, Schlick's approximation
// Schlick C. An inexpensive BRDF model for physically‐based rendering[C]//Computer graphics forum. Edinburgh, UK:
// Blackwell Science Ltd, 1994, 13(3): 233-246.
float F_Schlick(vec3 L, vec3 H_r, float F0) { return F0 + (1.0 - F0) * pow((1.0 - dot(L, H_r)), 5.0); }

float G_Smith(float NdotV) {
    const float _K = 1.0;
    return NdotV / (NdotV * (1.0 - _K) + _K);
}

// Bidirectional shadowing-masking function
// Used Smith G Approximate, according to Walter et al.
float G_GGX(float LdotN, float VdotN) { return G_Smith(LdotN) * G_Smith(VdotN); }

// Microfacet distribution function
// Trowbridge-Reitz GGX function
float D_GGX_TR(vec3 N, vec3 H) {
    const float _D =5.0;
    float d2 = _D * _D;
    return d2 / (PI * pow((pow(dot(N, H), 2.0) * (d2 - 1.0) + 1.0), 2.0));
}

vec3 GGX(Intersection i, LightSource light) {
    vec3 L = light.type == DIRECTIONAL_LIGHT_TYPE ? light.position : normalize(light.position - i.P.xyz);
    vec3 H = i.V + L;
    float LdotN = dot(L, i.N);
    float VdotN = dot(i.V, i.N);

    float F = F_Schlick(L, H, 1.0);
    float G = G_GGX(LdotN, VdotN);
    float D = D_GGX_TR(i.N, H);
    float fr = F * G * D / 4. / LdotN / VdotN;

    // lambert model as diffuse part
    vec3 diffuseLightColor = i.roughness * light.color * light.intensity * clamp(dot(i.N, L), 0.0, 1.0);
    const float ka = 0.3;
    diffuseLightColor += ka * texture(iChannel2, i.N).xyz;

    return i.baseColor.xyz * light.intensity + (diffuseLightColor + fr * texture(iChannel1, i.N).xyz);
}

// ----------------  shading technics ends  ----------------

vec3 Radiance(Ray r) {
    vec3 col = vec3(0);

    highp float t_min = INF;
    int idx = -1;
    // first pass
    for (int i = 0; i < SPHERE_N; i++) {
        float t = SphereIntersect(r, spheres[i]);
        if (t < t_min) {
            t_min = t;
            idx = i;
        }
    }

    // second pass
    // only directional light
    if (t_min < INF) {
        for (int i = 0; i < LIGHT_N; i++) {
            LightSource light = lights[i];
            vec4 P = vec4(r.origin + r.direction * t_min, 1.0);
            vec3 N = normalize(P.xyz - spheres[i].center);
            Intersection intersection = Intersection(P, N, -r.direction, texture(iChannel3, PolarWrap(N)), 0.5, 0.5);
            // col += Lambertian(intersection, light);
            // col += PerfectReflection(intersection, light);
            col += GGX(intersection, light);
        }
    } else {
        col = texture(iChannel1, r.direction).xyz;
    }
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

    vec3 col = vec3(uv, 0);

    SetupScene();

    Ray r = Ray(camera.position, normalize(vec3(uv, 1)), 0.0, 999.0);

    col = Radiance(r);

    fragColor = vec4(col, 1.0);
}