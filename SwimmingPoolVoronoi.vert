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

// inspired by "The Art of Code", aka. BigWIngs(https://www.shadertoy.com/user/BigWIngs)
vec2 N22(vec2 p) {
    vec3 a = fract(p.xyx * vec3(123.34, 234.34, 345.65));
    a += dot(a, a + 34.45);
    return fract(vec2(a.x * a.y, a.y * a.z));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float aspectRatio = iResolution.x / iResolution.y;
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (aspectRatio * fragCoord - iResolution.xy) / iResolution.y;
    float t = iTime;

    float N = 100.;
    float r = 0.02;

    float m = 0.;
    float minDist = 999999.;

    // generate random points, draw voronoi
    for (float i = 0.; i < N; i++) {
        vec2 n = N22(vec2(i));
        vec2 p = sin(n * t);
        p.x = p.x * aspectRatio;

        float d = length(p - uv);
        if (d < minDist) {
            minDist = d;
            m = d;
        }
    }

    // Output to screen
    vec3 col = vec3(0.01, 0.53, 0.87) * (1.4 + m) + vec3(1.7, 0., 0.) * m;

    fragColor = vec4(col, 1.0);
}