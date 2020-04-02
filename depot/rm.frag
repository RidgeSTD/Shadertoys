// global vars
vec2 mosPos = vec2(0);

vec2 disp(float t){ return vec2(sin(t*0.22)*1., cos(t*0.175)*1.)*2.; }


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5*iResolution.xy)/iResolution.y;
    float time = 3. * iTime;
    
    // mouse controling
    mosPos = (iMouse.xy - 0.5*iResolution.xy)/iResolution.y;
    

    // cam pos
    float dspAmp = .85;
    vec3 ro = vec3(0,0,time);
    ro += vec3(sin(iTime)*0.5,sin(iTime*1.)*0.,0);
    ro.xy += disp(ro.z)*dspAmp;
    
    // cam dir
    float tgtDst = 3.5;
    
    vec3 col = vec3(mosPos, 0.);
    
    fragColor = vec4(col,1.0);
}