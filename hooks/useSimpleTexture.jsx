import * as THREE from "three";

import RetriableTextureLoader from "../horror/RetriableTextureLoader";
import { useEffect } from "react";
import { useLoader } from "@react-three/fiber";

export function useSimpleTexture(path) {
  const texture = useLoader(RetriableTextureLoader, path);
  useEffect(() => {
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.transparent = true;
    texture.needsUpdate = true;
  }, [texture]);

  return texture;
}
