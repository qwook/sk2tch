import { ImageLoader, Loader, Texture } from "three";

export default class RetriableTextureLoader extends Loader {
  // eslint-disable-next-line no-useless-constructor
  constructor(manager) {
    super(manager);
  }

  load(url, onLoad, onProgress, onError) {
    const texture = new Texture();

    const loader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);

    let retries_left = 10;
    const loadFn = () => {
      retries_left--;
      loader.load(
        url,
        function (image) {
          texture.image = image;
          texture.needsUpdate = true;

          if (onLoad !== undefined) {
            onLoad(texture);
          }
        },
        onProgress,
        (err) => {
          if (retries_left > 0) {
            console.log(`Retrying ${url}...`);
            setTimeout(() => loadFn(), 1000 - retries_left * 100);
          } else {
            if (onError !== undefined) {
              err.message = `Failed to download this file. Check your internet connection.`;
              onError(err);
            }
          }
        }
      );
    };

    loadFn();

    return texture;
  }
}
