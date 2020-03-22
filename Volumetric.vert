void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    const float KEY_1 = 49.5/256.0;
	const float KEY_2 = 50.5/256.0;
	const float KEY_3 = 51.5/256.0;
    float key = 0.0;
    key += 0.7*texture(iChannel1, vec2(KEY_1,0.25)).x;
    key += 0.7*texture(iChannel1, vec2(KEY_2,0.25)).x;
    key += 0.7*texture(iChannel1, vec2(KEY_3,0.25)).x;
    
    // ro: ray origin
	// rd: direction of the ray
	vec3 rd = normalize(vec3((fragCoord.xy-0.5*iResolution.xy)/iResolution.y, 1.));
	vec3 ro = vec3(0., 0., -6.+key*1.6);

    vec3 col = vec3(rd.xy, 0);
    fragColor = vec4(col,1.0);
}