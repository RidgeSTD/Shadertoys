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

// #if HW_PERFORMANCE==0
#if 1
#define AA 1
#else
#define AA 2   // make this 2 or 3 for antialiasing
#endif

//------------------------------------------------------------------
float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }

float opRepLim(in float p, in float s, in float lim)
{
    return p-s*clamp(round(p/s),-lim,lim);
}

vec2 opRepLim( in vec2 p, in float s, in vec2 lim )
{
    return p-s*clamp(round(p/s),-lim,lim);
}

vec2 opRepLim( in vec2 p, in vec2 s, in vec2 lim )
{
    return p-s*clamp(round(p/s),-lim,lim);
}

vec2 opRepLim( in vec2 p, in float s, in vec2 limmin, in vec2 limmax )
{
    return p-s*clamp(round(p/s),-limmin,limmax);
}

float sdBox( vec3 p, vec3 b )
{
    vec3 d = abs(p) - b;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}


//------------------------------------------------------------------

vec2 opU( vec2 d1, vec2 d2 )
{
	return (d1.x<d2.x) ? d1 : d2;
}

//------------------------------------------------------------------

#define ZERO (min(iFrame,0))

//------------------------------------------------------------------

vec2 watchTower(in vec3 pos)
{
    // base
    vec3 q = pos;
    q.xz = opRepLim(q.xz, vec2(0.11, 0.11), vec2(5, 3));
    q.y -= 0.05 * 2.0 * 3.0;
    q.y = opRepLim(q.y, 0.06, 8.0);
    float d = sdBox( q-vec3( 0.0,0.0, 0.0), vec3(0.05,0.025,0.05) );
    // 抠掉内部房间
    q = pos;
    d = max(d, -sdBox(q-vec3(0.0,0.55,0.0), vec3(0.61, 0.1,0.381)));
    
    // shooting hole
    q = pos;
    q.xz = opRepLim(q.xz, vec2(0.3, 0.28), vec2(1.68, 1.0));
    q.y -= 0.55;
    q.y = opRepLim(q.y, 0.067, 1.0);
    d = min(d, sdBox( q-vec3( 0.0,0.0, 0.0), vec3(0.1,0.027,0.1) ));
    
    // 从射击孔中间抠出中空部分
    q = pos;
    d = max(d, -sdBox( q - vec3(0.0,0.55, 0.0), vec3(0.5,0.1,.29)));
    
    // 加上垛口
    q = pos;
    q.xz = opRepLim(q.xz, vec2(0.183, 0.16), vec2(3, 2.));
    q.y -= 0.85;
    q.y = opRepLim(q.y, 0.06, 0.5);
    d = min(d, sdBox(q, vec3(0.05, 0.025, 0.05)));
    q = pos;
    d = max(d, -sdBox(q - vec3(0.0, 0.85, 0.0), vec3(0.55, 0.1, 0.24)));

    return vec2(d, 7.2);
}

// return the height of current position
vec3 landscapeOffset(vec3 pos)
{
    float y = sin(pos.z * 0.3) -  pos.z * 0.3;
    y = 0.2 * sin(pos.z * 0.4) -  5.0 * sin(pos.z * 0.1);
    float x = 1.0 * cos(pos.z*0.4) * (1.0 + clamp(pos.z * 0.3, 0.0, 2.0));
    float z = 0.0;
    return vec3(x, y, z);
}

vec2 map( in vec3 pos )
{
    vec2 res = vec2( 1e10, 0.0 );
    
    // landscape offset
    vec3 posMod = pos + landscapeOffset(pos);

    // base
    {
        vec3 q = posMod;
        q.xy = opRepLim(q.xy, vec2(0.11, 0.06), vec2(3.0, 3.0));
        q.z = opRepLim(q.z, 0.11, 80.0);
        
        res = opU( res, vec2( sdBox( q-vec3( 0.0,0.0, 0.0), vec3(0.05,0.025,0.05) ), 3.0 ) );
    }
    
    // inner wall
    {
        vec3 q = posMod;
        q.y -= 0.025 * 2.0 * 6.0;
        q.x -= 0.05 * 2.0 * 3.0 + 0.025;
        q.yz = opRepLim(q.yz, vec2(0.06, 0.11), vec2(1, 80));
        res = opU( res, vec2( sdBox( q-vec3( 0.0,0.0, 0.0), vec3(0.05,0.025,0.05) ), 4.0 ) );
    }
    
    // battlement wall
    {
        vec3 q = posMod;
        q.y -= 0.025 * 2.0 * 5.0;
        q.x += 0.05 * 2.0 * 3.0 + 0.025;
        q.yz = opRepLim(q.yz, vec2(0.06, 0.11), vec2(0.5, 80));
        res = opU( res, vec2( sdBox( q-vec3( 0.0,0.0, 0.0), vec3(0.05,0.025,0.05) ), 5.0 ) );
        q = posMod;
        q.y -= 0.025 * 2.0 * 7.0;
        q.x += 0.05 * 2.0 * 3.0 + 0.025;
        q.yz = opRepLim(q.yz, vec2(0.06, 0.17), vec2(0.5, 80));
        res = opU( res, vec2( sdBox( q-vec3( 0.0,0.0, 0.0), vec3(0.05,0.025,0.05) ), 5.5 ) );
    }
    
    // watch tower
    {
        float watchTowerDis = 10.0;
        
        vec3 q = pos;
        // get the remain part of opRepLim function to project position
        // to local origin
        float midZ = watchTowerDis * clamp(round(q.z / watchTowerDis), -4.0, 4.0);
        q += landscapeOffset(vec3(q.x, q.y, midZ));

        q.z = opRepLim(q.z, watchTowerDis, 4.0);
        
        res = opU( res, watchTower(q) );
    }
    
    
    return res;
}

// http://iquilezles.org/www/articles/boxfunctions/boxfunctions.htm
vec2 iBox( in vec3 ro, in vec3 rd, in vec3 rad ) 
{
    vec3 m = 1.0/rd;
    vec3 n = m*ro;
    vec3 k = abs(m)*rad;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
	return vec2( max( max( t1.x, t1.y ), t1.z ),
	             min( min( t2.x, t2.y ), t2.z ) );
}

vec2 raycast( in vec3 ro, in vec3 rd )
{
    vec2 res = vec2(-1.0,-1.0);

    float tmin = 1.0;
    float tmax = 20.0;

    // // raytrace floor plane
    // float tp1 = (0.0-ro.y)/rd.y;
    // if( tp1>0.0 )
    // {
    //     tmax = min( tmax, tp1 );
    //     res = vec2( tp1, 1.0 );
    // }
    
    // bouding包围盒
    // raymarch primitives   
    vec2 tb = iBox( ro-vec3(0.0,0.4,-0.5), rd, vec3(20,20,20) );
    if( tb.x<tb.y && tb.y>0.0 && tb.x<tmax)
    {
        //return vec2(tb.x,2.0);
        tmin = max(tb.x,tmin);
        tmax = min(tb.y,tmax);

        float t = tmin;
        for( int i=0; i<70 && t<tmax; i++ )
        {
            vec2 h = map( ro+rd*t );
            if( abs(h.x)<(0.0001*t) )
            { 
                res = vec2(t,h.y); 
                break;
            }
            t += h.x;
        }
    }
    
    return res;
}

// http://iquilezles.org/www/articles/rmshadows/rmshadows.htm
float calcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax )
{
    // bounding volume
    float tp = (0.8-ro.y)/rd.y; if( tp>0.0 ) tmax = min( tmax, tp );

    float res = 1.0;
    float t = mint;
    for( int i=ZERO; i<16; i++ )
    {
		float h = map( ro + rd*t ).x;
        float s = clamp(8.0*h/t,0.0,1.0);
        res = min( res, s*s*(3.0-2.0*s) );
        t += clamp( h, 0.02, 0.10 );
        if( res<0.005 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );
}

// http://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calcNormal( in vec3 pos )
{
#if 0
    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
    return normalize( e.xyy*map( pos + e.xyy ).x + 
					  e.yyx*map( pos + e.yyx ).x + 
					  e.yxy*map( pos + e.yxy ).x + 
					  e.xxx*map( pos + e.xxx ).x );
#else
    // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
    vec3 n = vec3(0.0);
    for( int i=ZERO; i<4; i++ )
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(pos+0.0005*e).x;
      //if( n.x+n.y+n.z>100.0 ) break;
    }
    return normalize(n);
#endif    
}

float calcAO( in vec3 pos, in vec3 nor )
{
	float occ = 0.0;
    float sca = 1.0;
    for( int i=ZERO; i<5; i++ )
    {
        float h = 0.01 + 0.12*float(i)/4.0;
        float d = map( pos + h*nor ).x;
        occ += (h-d)*sca;
        sca *= 0.95;
        if( occ>0.35 ) break;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 ) * (0.5+0.5*nor.y);
}

// http://iquilezles.org/www/articles/checkerfiltering/checkerfiltering.htm
float checkersGradBox( in vec2 p, in vec2 dpdx, in vec2 dpdy )
{
    // filter kernel
    vec2 w = abs(dpdx)+abs(dpdy) + 0.001;
    // analytical integral (box filter)
    vec2 i = 2.0*(abs(fract((p-0.5*w)*0.5)-0.5)-abs(fract((p+0.5*w)*0.5)-0.5))/w;
    // xor pattern
    return 0.5 - 0.5*i.x*i.y;                  
}

vec3 render( in vec3 ro, in vec3 rd, in vec3 rdx, in vec3 rdy )
{ 
    // background
    vec3 col = vec3(0.77,0.93,1.00) - max(rd.y,0.0)*0.3;
    
    // raycast scene
    vec2 res = raycast(ro,rd);
    float t = res.x;
	float m = res.y;
    if( m>-0.5 )
    {
        vec3 pos = ro + t*rd;
        vec3 nor = (m<1.5) ? vec3(0.0,1.0,0.0) : calcNormal( pos );
        vec3 ref = reflect( rd, nor );
        
        // material        
        col = 0.2 + 0.2*sin( m*2.0 + vec3(0.0,1.0,2.0) );
        float ks = 1.0;
        
        if( m<1.5 )
        {
            // project pixel footprint into the plane
            vec3 dpdx = ro.y*(rd/rd.y-rdx/rdx.y);
            vec3 dpdy = ro.y*(rd/rd.y-rdy/rdy.y);

            float f = checkersGradBox( 3.0*pos.xz, 3.0*dpdx.xz, 3.0*dpdy.xz );
            col = 0.15 + f*vec3(0.05);
            ks = 0.4;
        }

        // lighting
        float occ = calcAO( pos, nor );
        
		vec3 lin = vec3(0.0);

        // sun
        {
            vec3  lig = normalize( vec3(-0.5, 0.4, -0.6) );
            vec3  hal = normalize( lig-rd );
            float dif = clamp( dot( nor, lig ), 0.0, 1.0 );
        	      dif *= calcSoftshadow( pos, lig, 0.02, 2.5 );
			float spe = pow( clamp( dot( nor, hal ), 0.0, 1.0 ),16.0);
                  spe *= dif;
                  spe *= 0.04+0.96*pow(clamp(1.0-dot(hal,lig),0.0,1.0),5.0);
            lin += col*2.20*dif*vec3(1.30,1.00,0.70);
            lin +=     5.00*spe*vec3(1.30,1.00,0.70)*ks;
        }
        // sky
        {
            float dif = sqrt(clamp( 0.5+0.5*nor.y, 0.0, 1.0 ));
                  dif *= occ;
            float spe = smoothstep( -0.2, 0.2, ref.y );
                  spe *= dif;
                  spe *= calcSoftshadow( pos, ref, 0.02, 2.5 );
                  spe *= 0.04+0.96*pow(clamp(1.0+dot(nor,rd),0.0,1.0), 5.0 );
            lin += col*0.60*dif*vec3(0.40,0.60,1.15);
            lin +=     2.00*spe*vec3(0.40,0.60,1.30)*ks;
        }
        // back
        {
        	float dif = clamp( dot( nor, normalize(vec3(0.5,0.0,0.6))), 0.0, 1.0 )*clamp( 1.0-pos.y,0.0,1.0);
                  dif *= occ;
        	lin += col*0.55*dif*vec3(0.25,0.25,0.25);
        }
        // sss
        {
            float dif = pow(clamp(1.0+dot(nor,rd),0.0,1.0),2.0);
                  dif *= occ;
        	lin += col*0.25*dif*vec3(1.00,1.00,1.00);
        }
        
		col = lin;

        col = mix( col, vec3(0.7,0.7,0.9), 1.0-exp( -0.0001*t*t*t ) );
    }

	return vec3( clamp(col,0.0,1.0) );
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv =          ( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 mo = iMouse.xy/iResolution.xy;
    mo -= vec2(0.5,0.5);
	float time = 32.0 + iTime*1.5;

    // camera
    float camRotRadius = 10.5;
    // vec3 ta = vec3( 0.5, -0.5, -0.6 );
    vec3 ta = vec3( 0, 1, 0 );
    // vec3 ro = ta + vec3( camRotRadius*cos(camRotSpeed*time + 7.0*mo.x), 1.3 + 2.0*mo.y, camRotRadius*sin(camRotSpeed*time + 7.0*mo.x) );
    vec3 ro = ta + vec3( 1, -4, -8.0 );
    // ro += vec3( camRotRadius*mo.x, camRotRadius*mo.y, camRotRadius*mo.x );
    // camera-to-world transformation
    mat3 ca = setCamera( ro, ta, 0.0 );

    vec3 tot = vec3(0.0);
#if AA>1
    for( int m=ZERO; m<AA; m++ )
    for( int n=ZERO; n<AA; n++ )
    {
        // pixel coordinates
        vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
        vec2 p = (2.0*(fragCoord+o)-iResolution.xy)/iResolution.y;
#else    
        vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
#endif

        // ray direction
        vec3 rd = ca * normalize( vec3(p,2.5) );

         // ray differentials
        vec2 px = (2.0*(fragCoord+vec2(1.0,0.0))-iResolution.xy)/iResolution.y;
        vec2 py = (2.0*(fragCoord+vec2(0.0,1.0))-iResolution.xy)/iResolution.y;
        vec3 rdx = ca * normalize( vec3(px,2.5) );
        vec3 rdy = ca * normalize( vec3(py,2.5) );
        
        // render	
        vec3 col = render( ro, rd, rdx, rdy );

        // gain
        // col = col*3.0/(2.5+col);
        
        tot += col;
#if AA>1
    }
    tot /= float(AA*AA);
#endif
    
    fragColor = vec4( tot, 1.0 );
}