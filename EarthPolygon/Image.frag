// Credit for editing vertex: "The Earth by Markson Chen"
// https://www.desmos.com/calculator/9in2aizsi9

#define RADIUS 0.5

#define PI 3.14159265359
#define IN_POLYGON(vs,p,rotation,isIn) {isIn=false;int vc = vs.length();if(vc>=0){for(int i = 0, j = vc - 1; i < vc; j = i++){vec2 vsSphereI=sphereMapping(vs[i],rotation);vec2 vsSphereJ=sphereMapping(vs[j],rotation);if ( (vsSphereI.y > p.y) != (vsSphereJ.y > p.y)&& (p.x - vsSphereI.x) > (vsSphereJ.x - vsSphereI.x) * (p.y - vsSphereI.y) / (vsSphereJ.y - vsSphereI.y)) {isIn = !isIn;}}}}
#define DRAW_POLYGON(vs,p,rotation,isIn,c,t,col) {IN_POLYGON(vs,p,rotation,isIn);if(isIn){col=mix(col,c,t);}}

vec2 sphereMapping(vec2 uv, vec2 rotation)
{
    float xSphere = -cos(uv.y)*cos(uv.x + rotation.x);
    float ySphere = -cos(uv.y) * sin(rotation.y) * sin(uv.x + rotation.x) + sin(uv.y) * cos(rotation.y);
    return vec2(xSphere, ySphere);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = uv * 2. - 1.;
    p.x *= iResolution.x / iResolution.y;


    setUpTransparency();
    setUpColor();
    
    
    // Output to screen
    vec3 col = vec3(0.02,0.03,0.1);

    bool isIn;
    vec2 mouse = iMouse.xy/iResolution.xy;
    if (mouse.x < 0.01) mouse.xy = vec2(0.7, 0.45);
    vec2 rotation = vec2(mod(iTime * 0.9 + mouse.x * 6., 2. * PI), 0.0);
    DRAW_POLYGON(verticesPolygon0, p, rotation, isIn, colorPolygon[0], transparencyPolygon[0], col);
    DRAW_POLYGON(verticesPolygon1, p, rotation, isIn, colorPolygon[1], transparencyPolygon[1], col);
    DRAW_POLYGON(verticesPolygon2, p, rotation, isIn, colorPolygon[2], transparencyPolygon[2], col);
    DRAW_POLYGON(verticesPolygon3, p, rotation, isIn, colorPolygon[3], transparencyPolygon[3], col);
    DRAW_POLYGON(verticesPolygon4, p, rotation, isIn, colorPolygon[4], transparencyPolygon[4], col);
    DRAW_POLYGON(verticesPolygon5, p, rotation, isIn, colorPolygon[5], transparencyPolygon[5], col);
    DRAW_POLYGON(verticesPolygon6, p, rotation, isIn, colorPolygon[6], transparencyPolygon[6], col);
    DRAW_POLYGON(verticesPolygon7, p, rotation, isIn, colorPolygon[7], transparencyPolygon[7], col);
    DRAW_POLYGON(verticesPolygon8, p, rotation, isIn, colorPolygon[8], transparencyPolygon[8], col);
    DRAW_POLYGON(verticesPolygon9, p, rotation, isIn, colorPolygon[9], transparencyPolygon[9], col);
    DRAW_POLYGON(verticesPolygon10, p, rotation, isIn, colorPolygon[10], transparencyPolygon[10], col);
    DRAW_POLYGON(verticesPolygon11, p, rotation, isIn, colorPolygon[11], transparencyPolygon[11], col);
    DRAW_POLYGON(verticesPolygon12, p, rotation, isIn, colorPolygon[12], transparencyPolygon[12], col);
    DRAW_POLYGON(verticesPolygon13, p, rotation, isIn, colorPolygon[13], transparencyPolygon[13], col);
    DRAW_POLYGON(verticesPolygon14, p, rotation, isIn, colorPolygon[14], transparencyPolygon[14], col);
    DRAW_POLYGON(verticesPolygon15, p, rotation, isIn, colorPolygon[15], transparencyPolygon[15], col);
    DRAW_POLYGON(verticesPolygon16, p, rotation, isIn, colorPolygon[16], transparencyPolygon[16], col);
    DRAW_POLYGON(verticesPolygon17, p, rotation, isIn, colorPolygon[17], transparencyPolygon[17], col);
    DRAW_POLYGON(verticesPolygon18, p, rotation, isIn, colorPolygon[18], transparencyPolygon[18], col);
    DRAW_POLYGON(verticesPolygon19, p, rotation, isIn, colorPolygon[19], transparencyPolygon[19], col);
    DRAW_POLYGON(verticesPolygon20, p, rotation, isIn, colorPolygon[20], transparencyPolygon[20], col);
    DRAW_POLYGON(verticesPolygon21, p, rotation, isIn, colorPolygon[21], transparencyPolygon[21], col);
    DRAW_POLYGON(verticesPolygon22, p, rotation, isIn, colorPolygon[22], transparencyPolygon[22], col);
    DRAW_POLYGON(verticesPolygon23, p, rotation, isIn, colorPolygon[23], transparencyPolygon[23], col);
    DRAW_POLYGON(verticesPolygon24, p, rotation, isIn, colorPolygon[24], transparencyPolygon[24], col);
    DRAW_POLYGON(verticesPolygon25, p, rotation, isIn, colorPolygon[25], transparencyPolygon[25], col);

    fragColor = vec4(col,1.0);
}