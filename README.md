# The Shadertoy Repo

A repository where some gizmos about CG are stored. [Shadertoy](https://www.shadertoy.com/) is a platform providing WebGL programming and demonstrating functions. This repo is still in update.

## Currently released shaders (click on pictures to visit live code):

### Welcome home, spacemen! (2020-06-03)

A further development based on nimitz's "Re-entry". First time modelling on space to combine primitives with math in ray-marching. Additional cinematic camera behaviour when using telescope and create a tense atmosphere. The flame is created by combining FBMs of different frequencies. Also multiple pass ray-marching create a dramatic volumetric shading.

[<img src="https://github.com/RidgeSTD/Shadertoys/blob/develope/demo/gifs/Welcomehome_Spacemen.gif?raw=true" style="width:640px;height:360px;">](https://www.shadertoy.com/view/wsBfW3)
<!-- <iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/wsBfW3?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe> -->



### Candle Night (2020-05-17)

An applycation of fluid dynamics using navier-stokes. Read the introduction of [GPU Gem Chap. 8](https://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch38.html) and adjusted according to Shaderstory. Shaderstory has the limitation of only single fragment-shader call between two frames. A brilliant solution is provided by [trirop](https://www.shadertoy.com/user/trirop) that a pre-calculated weight kernel is used to fake the Jacobi iteration. In Buffer A the smoke flows up according to its temporature and sinks according to its density. The cooling function is pseudo-exponential, after several heuristic tries.

[<img src="https://github.com/RidgeSTD/Shadertoys/blob/develope/demo/gifs/Candle_night.gif?raw=true" style="width:640px;height:360px;">](https://www.shadertoy.com/view/3dsBWj)
<!-- <iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/3dsBWj?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe> -->

### Eye/pupil reaction (2020-04-10)

After leaning about [Fractional Brownian motion](https://en.wikipedia.org/wiki/Fractional_Brownian_motion), and read the inspirational [shader by iq](https://www.shadertoy.com/view/lsfGRr), this eye with two iris color is created, but with more realistic animation. Eye reacts according to lighting intensity, FBM procedural iris texture. simple environment reflection on iris.

[<img src="https://github.com/RidgeSTD/Shadertoys/blob/develope/demo/gifs/Eye_pupil_reaction.gif?raw=true" style="width:640px;height:360px;">](https://www.shadertoy.com/view/wdSczR)
<!-- <iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/wdSczR?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe> -->

### PBR GGX + Environment map (2020-02-22)

A simple PBR shader with environment map. Forward shading, directional+point light sources. Unity-style approximation. Rather a research experiment, gamma correction or more still fails.

+ GGX: Walter et al.
+ Fresnel term: Schlick C.
+ Visibility/geometry term: Smith shadow-masking
+ Distribution term: Trowbridge-Reitz

[<img src="https://github.com/RidgeSTD/Shadertoys/blob/develope/demo/gifs/PBR_GGX_Ball.gif?raw=true" style="width:640px;height:360px;">](https://www.shadertoy.com/view/WldXz2)
<!-- <iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/WldXz2?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe> -->

### Multi-sampling Motion blur 3D (2020-02-14)

A moving ball in 3D space. Motion blurred by averaging the multi-sampling of past 24 frames.

[<img src="https://github.com/RidgeSTD/Shadertoys/blob/develope/demo/gifs/MS_Motion_blur.gif?raw=true" style="width:640px;height:360px;">](https://www.shadertoy.com/view/ttcXD2)
<!-- <iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/ttcXD2?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe> -->

### The Swimming Pool (2019-01-13)

First time knowing Shadertoy. In the visualization's course, the Voronoi diagram reminds me of the caustic in swimming pool (although they are way from realistic).

[<img src="https://github.com/RidgeSTD/Shadertoys/blob/develope/demo/gifs/Swimming_pool.gif?raw=true" style="width:640px;height:360px;">](https://www.shadertoy.com/view/3ss3DB)
<!-- <iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/3ss3DB?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe> -->