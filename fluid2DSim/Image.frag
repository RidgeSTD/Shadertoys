void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // buffer A stores the (vx, vy, p, d):
    //  - vx, vy: velocity in two directions
    //  - p: pressure
    //  - d: dye density

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;

    // density
    //fragColor = vec4(vec3(texture(iChannel0, uv).w), 1.0);
    
    // velocity
    fragColor = vec4(texture(iChannel0, uv).xy, 0, 1);
    
    // Debug
    //fragColor = vec4(texture(iChannel1, uv));
}