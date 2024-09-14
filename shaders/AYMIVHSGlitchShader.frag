
#include <common>
precision mediump float;

// control parameter
uniform float time;

uniform bool grayscale;

// noise effect intensity value (0 = no effect, 1 = full effect)
uniform float nIntensity;

// scanlines effect intensity value (0 = no effect, 1 = full effect)
uniform float sIntensity;

uniform float parentIntensity;

// scanlines effect count value (0 = no effect, 4096 = full effect)
uniform float sCount;

uniform sampler2D tDiffuse;
// uniform sampler2D tGhostGirl;
uniform sampler2D tParent;

varying vec2 vUv;

// "    vec4 sharpen(in sampler2D tex, in vec2 coords, in vec2 renderSize) {
// "      float dx = 1.0 / renderSize.x;
// "      float dy = 1.0 / renderSize.y;
// "      vec4 sum = vec4(0.0);
// "      sum += -1. * texture2D(tex, coords + vec2( -1.0 * dx , 0.0 * dy));
// "      sum += -1. * texture2D(tex, coords + vec2( 0.0 * dx , -1.0 * dy));
// "      sum += 5. * texture2D(tex, coords + vec2( 0.0 * dx , 0.0 * dy));
// "      sum += -1. * texture2D(tex, coords + vec2( 0.0 * dx , 1.0 * dy));
// "      sum += -1. * texture2D(tex, coords + vec2( 1.0 * dx , 0.0 * dy));
// "      return sum;
// "    }

void main()
{
  float modTime = mod(time, 100.0);

  // make some noise
  float dx = rand(floor(vUv * 800.0) / 800.0 + modTime);
  float dx2 = rand(floor(vUv * 800.0) / 800.0 + modTime);

  if (nIntensity == 0.0)
  {
    vec4 screen = texture2D(tDiffuse, vUv);
    if (parentIntensity != 0.0) {
      float osc = (cos(time/10.0)/2.0 + 0.5) * parentIntensity;

      float pictureSize = 0.25;
      float ratio = 640.0f / 480.0f;
      vec2 parentUv = (vUv - vec2(0.4, 1.0 / ratio - 0.5)) / vec2(pictureSize, pictureSize * ratio);
      parentUv.x *= 1.0 + ((1.0 - osc)*(dx))/5.0;
      vec4 parent1 = texture2D(tParent, parentUv);
      parentUv.x -= parent1.r * (sin(osc * 3.14 * 10.0) * (1.0-parentIntensity) * 2.0);
      if (parentUv.x >= 0.0 && parentUv .x <= 1.0 && parentUv.y >= 0.0 && parentUv.y <= 1.0) {
        vec4 parent = texture2D(tParent, parentUv);
        screen = (screen * (1.0 - parentIntensity)) + parent * parentIntensity;
      } else {
        screen = texture2D(tDiffuse, vUv + screen.rg * vec2(parentIntensity * dx * 0.05, 0.0));
      }
    }

    gl_FragColor = screen;
    return;
  }

  // vec4 cTextureScreen = texture2D( tDiffuse, vUv + vec2((1.0-averageGhostgirl.r)*(dx-0.5)/100.0, (1.0-averageGhostgirl.g)*(dx2-0.5)/100.0) );
  float offset = 0.0f;
  float offsetY = vUv.y / (1.0f * mod(time / 1.0f, 5.0f));
  if (abs(mod(pow(floor(vUv.y * 70.0f), cos(time / 0.5f) / 100.0f + 1.5f), 150.0f) - mod(floor((time + dx2 * 200.0f) / 2.0f), 100.0f)) < 20.0f)
  {
    offset = 0.01f * nIntensity;
  }
  vec4 cTextureScreen = texture2D(tDiffuse, vUv + vec2(offset, offset));

  // Weird chromatic abberation
  float offsetY2 = pow(cos(time / 100.0f + vUv.y * 10.0f) + cos(time / 200.0f + vUv.y * 10.0f) * 0.2f, 5.0f) / 200.0f;
  vec3 weirdRGBThing = texture2D(tDiffuse, vUv + vec2(-0.009 + offsetY2 * (cos(vUv.y * 20.0f * time / 100.0f) * 2.0f), offset - 0.005)).rgb;
  if (weirdRGBThing.r + weirdRGBThing.g + weirdRGBThing.b < 1.5)
  {
    cTextureScreen.rgb = cTextureScreen.rgb + vec3(0.08, 0.08, 0.08) * (nIntensity * 2.0);
  }
  vec3 moreWeirdRgbThing = texture2D(tDiffuse, vUv + vec2(-0.02 + offsetY2 * (cos(vUv.y * 20.0f * time / 100.0f) * 5.0f), offset - 0.005)).rgb;
  if (moreWeirdRgbThing.r + moreWeirdRgbThing.g + moreWeirdRgbThing.b < 1.5)
  {
    cTextureScreen.b = cTextureScreen.b * (1.0 + 0.5 * (nIntensity * 2.0)); //+ vec2(0.2, 0.2);
    cTextureScreen.g = cTextureScreen.g * (1.0 + 0.1 * (nIntensity * 2.0)); //+ vec2(0.2, 0.2);
    cTextureScreen.r = cTextureScreen.r - 0.05f * (nIntensity * 2.0);       //+ vec2(0.2, 0.2);
  }

  // Lines going through
  if (offset > 0.00f)
  {
    float almostRandom = (cos(time * 2.0 + 0.5f) + cos(time * 0.8f) + cos(time * 101.0f)) / 6.0f + 1.5f;
    // cTextureScreen.rgb = vec3(2.0, 2.0, 2.0) - (cTextureScreen.rgb * 1.01f);
    // cTextureScreen.rgb = cTextureScreen.rgb - almostRandom*0.5f;
    cTextureScreen.rgb = cTextureScreen.rgb - almostRandom * 0.1f * (nIntensity * 1.0);
  }

  float contrast = 1.0 + 0.5 * (nIntensity * 2.0);
  float brightness = -0.4 * (nIntensity * 2.0);

  vec3 colorContrasted = (cTextureScreen.rgb - 0.5) * contrast + 0.5;
  vec3 bright = colorContrasted + vec3(brightness, brightness, brightness);
  // " vec3 sharpend = sharpen(tDiffuse, vUv, vec2(800, 400)).rgb;
  // cTextureScreen.rgb = bright * 0.7;// +  sharpend * 0.3;
  cTextureScreen.rgb = bright;
  vec2 vigUv = vUv;
  vigUv *= 1.0 - vUv.yx;                                 // vec2(1.0)- vUv.yx; -> 1.-u.yx;
  float vig = (vigUv.x / 2.0) * (vigUv.y / 2.0) * 250.0; // multiply with sth for intensity
  vig = pow(vig, 0.5);                                   // change pow for modifying the extend of the  vignette

  // Multiply cTextureScreen by vignette.
  // "    cTextureScreen.rgb *= vig;

  // add noise
  vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp(dx * 50.0 - 9.0, -1.0, 1.0);
  cResult = cResult - vec3(0.5, 0.5, 0.5) * clamp(dx2 * 35.0 - 15.0, 0.0, 1.0);
  cResult = cResult + vec3(dx, dx, dx) * 0.2;

  // cResult = cResult - vec3(0.5, 2.0, 2.0) * clamp( (dx2 * (1.0-(vig/2.5)))*35.0-15.0, 0.0, 1.0 );
  // cResult = cResult + vec3(dx, dx, dx) * 0.2 * (1.0-averageGhostgirl.r);

  // // get us a sine and cosine
  // "	vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );

  // // add scanlines
  // "	cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;

  // // interpolate between source and result by intensity
  // " cResult.gb /= (1.3);
  // cResult.r *= (1.6 - (0.6 * (1.0-averageGhostgirl.r)));
  // cResult = cTextureScreen.rgb + clamp( ((2.0 - averageGhostgirl.r * 2.0) + nIntensity), 0.0, 1.0 ) * ( cResult - cTextureScreen.rgb );

  cResult = cTextureScreen.rgb * clamp(1.0 - nIntensity, 0.0, 1.0) + clamp(nIntensity, 0.0, 1.0) * (cResult);

  // Make it more red.

  // // convert to grayscale if desired
  // "	if( grayscale ) {

  // "		cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );

  // "	}

  gl_FragColor = vec4(cResult, cTextureScreen.a);
}