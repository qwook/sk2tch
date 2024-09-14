/**
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

import fragmentShader from "./AYMIVHSGlitchShader.frag";
import vertexShader from "./AYMIVHSGlitchShader.vert";

export const AYMIVHSGlitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    tParent: { value: null },
    time: { value: 0.0 },
    nIntensity: { value: 0.5 },
    sIntensity: { value: 0.05 },
    parentIntensity: { value: 0.0 },
    sCount: { value: 4096 },
    grayscale: { value: 1 },
  },

  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
};
