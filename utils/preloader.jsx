// This is deprecated in favor of just using require()
// to bundle assets when needed.

const assets = [];

const loadQueue = [];

function Load(path) {
  // Load path into an <img> that is hidden in the background:
  let img;

  const handled = () => {
    if (img.parentNode === document.body) {
      document.body.removeChild(img);
    }

    if (loadQueue.length > 0) {
      Load(loadQueue.shift());
    }
  };

  if (path.endsWith(".mp3") || path.endsWith(".wav")) {
    // return path;
    if (typeof Audio === "undefined") {
      return;
    }
    img = new Audio();
    img.addEventListener("loadeddata", handled);
  } else if (path.endsWith(".mp4")) {
    img = document.createElement("video");
    img.addEventListener("canplay", handled);
  } else {
    img = new Image();
    // Delete img once the image has loaded:
    img.onload = handled;
    // Also handle when img doesn't successfully load:
    img.onerror = handled;
  }
  img.style.display = "none";
  document.body.appendChild(img);

  img.src = path;
}

let loaded = 0;
function QueueToLoad(path) {
  if (loaded < 5) {
    Load(path);
    loaded++;
  } else {
    loadQueue.push(path);
  }
}

export function UseAsset(path) {
  if (process.env.TARGET === "server") {
    assets.push(path);
    return;
  }

  QueueToLoad(path);

  return path;
}

export function getAssetsList() {
  return assets;
}
