import { FullScreenQuad, Pass } from "three-stdlib";
// import { FullScreenQuad, Pass } from './Pass'
import {
  ShaderMaterial,
  Texture,
  UniformsUtils,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

import { AYMIVHSGlitchShader } from "./AYMIVHSGlitchShader";
import { pausibleNow } from "../utils/scheduler";

class AYMIVHSGlitchPass extends Pass {
  public material: ShaderMaterial;
  public fsQuad: FullScreenQuad;

  public uniforms;
  public noiseIntensity;
  public noiseTarget;
  public parentMap;

  constructor(
    noiseIntensity?: number,
    // noiseTarget?: WebGLRenderTarget,
    parentMap?: Texture,
    scanlinesIntensity?: number,
    scanlinesCount?: number,
    grayscale?: boolean
  ) {
    super();

    this.noiseIntensity = noiseIntensity;
    // this.noiseTarget = noiseTarget;
    this.parentMap = parentMap;

    if (AYMIVHSGlitchShader === undefined)
      console.error("THREE.FilmPass relies on NoiseGrainShader");

    const shader = AYMIVHSGlitchShader;

    this.uniforms = UniformsUtils.clone(shader.uniforms);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });

    if (grayscale !== undefined) this.uniforms.grayscale.value = grayscale;
    if (noiseIntensity !== undefined)
      this.uniforms.nIntensity.value = noiseIntensity;
    if (scanlinesIntensity !== undefined)
      this.uniforms.sIntensity.value = scanlinesIntensity;
    if (scanlinesCount !== undefined)
      this.uniforms.sCount.value = scanlinesCount;

    this.fsQuad = new FullScreenQuad(this.material);
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    deltaTime: number
  ): void {
    this.uniforms["tParent"].value = this.parentMap;
    // this.uniforms["tGhostGirl"].value = this.noiseTarget.texture;
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    const newTime = pausibleNow(); //; (Math.floor(pausibleNow() * 100) / 100) % 100;
    if (newTime !== this.uniforms["time"].value) {
      this.uniforms["time"].value = newTime;
    }
    this.uniforms.nIntensity.value = this.noiseIntensity;
    this.uniforms.parentIntensity.value = this.parentIntensity;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}

export { AYMIVHSGlitchPass as NoiseGrainPass };
