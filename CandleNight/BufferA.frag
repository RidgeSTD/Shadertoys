Shadertoy
Search...
Welcome winlandiano | Browse New Logout
0.0041.9 fps640 x 360
Candle night

add this shader to a playlist share this shader  0
Views: 0, Tags: 
simulation, fluid, stroke, navierstokes
Created by winlandiano in -

navier stokes
 
CommonBuffer ABuffer BBuffer CBuffer DImage
Shader Inputs
uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)
uniform float     iTimeDelta;            // render time (in seconds)
uniform int       iFrame;                // shader playback frame
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
vec2 wickTipPos = WICK_POS + vec2(0.035, WICK_LEN * 2.);
22
    return p - h / 3. * (0.5 * k1 + k2 + k3 + 0.5 * k4);
23
}
24
​
25
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
26
    vec2 uv = fragCoord / iResolution.xy;
27
    vec2 pos = uv * 2. - 1.;
28
    float asp_ratio = iResolution.x / iResolution.y;
29
    pos.x *= asp_ratio;
30
    bool lit = mod(iTime, ANIM_DUR) < LIT_DUR;
31
​
32
    vec2 preUV = eulerInte(fragCoord) / iResolution.xy;
33
    // vec2 preUV = Rk4Inte(fragCoord) / iResolution.xy;
34
    preUV = SAT(preUV);
35
    vec4 newV = texture(iChannel0, preUV);
36
​
37
    // apply diffusion
38
    newV *= DIFFUSE_VEC;
39
​
40
    // hot air and smoke
41
    // reference: Fedkiw et al. 2001
42
    // reference: https://youtu.be/mLp_rSBzteI?t=40
43
    vec2 wickTipPos = WICK_POS + vec2(0.035, WICK_LEN * 2.);
44
    float cool = COOLING(mod(iTime, ANIM_DUR) - LIT_DUR);
45
    if (length(pos - wickTipPos) < 0.015) {
46
        if (lit) {
47
            newV.z = WICK_TEMP;
48
        } else {
49
            newV.z = AMBIENT_TEMP + TEMP_DIFF * cool;
50
            newV.w = SAT(cool * 3.);
51
        }
52
    }
53
    vec2 forceBuoyancy = vec2(0, -SMOKE_GRAVITY_FACT * newV.w + SMOKE_TEMP_FACT * max(0., newV.z - AMBIENT_TEMP));
54
    newV.xy += forceBuoyancy;
55
​
56
    // viscosity term
57
    vec2 gL = xyGrad(iChannel0, fragCoord - vec2(1, 0), iResolution.xy);
58
    vec2 gR = xyGrad(iChannel0, fragCoord + vec2(1, 0), iResolution.xy);
59
    vec2 gB = xyGrad(iChannel0, fragCoord - vec2(0, 1), iResolution.xy);
60
    vec2 gT = xyGrad(iChannel0, fragCoord + vec2(0, 1), iResolution.xy);
61
    vec2 lapU = (gR - gL + gT - gB) * HALF_RDX;
62
    newV.xy += VISCOCITY * lapU * iTimeDelta;
63
​
64
    // close boundary condition, pure Neumann pressure boundary
65
    if (fragCoord.x < 2. || fragCoord.x > iResolution.x - 2. || fragCoord.y < 2. || fragCoord.y > iResolution.y - 2.) {
66
        newV.xy = vec2(0);
67
    }
68
​
69
    fragColor = newV;
70
}
Compile (<ALT>+<ENTER>) Compiled in 0.0 / 0.3 secs (analyze)
1448 / 33292 chars
Render Image  Show GLSL help



remove input
iChannel0
sampler options



remove input
iChannel1
sampler options



iChannel2



iChannel3
Comments (0)

 Your comment...

Community Forums
Official Events
In Facebook (english)
In Facebook (korean)
In Discord (direct link)
Feedback and Support
Facebook
Twitter
Patreon
Roadmap
Email
Shadertoy
Store
Documentation
Terms & Privacy
About
Apps and Plugins
Official iPhone App by Reinder
Screensaver by Kosro
Shadertoy plugin by Patu
Tutorials
Shader coding intro by iq
Shadertoy Unofficial by FabriceNeyret2