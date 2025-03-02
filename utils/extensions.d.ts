declare module "*.frag" {
  const frag: { [key: string]: string };
  export default frag;
}
declare module "*.vert" {
  const vert: { [key: string]: string };
  export default vert;
}
declare module "*.txt" {
  export default string;
}

declare module "*.mp4" {
  export default string;
}

declare module "*.mp3" {
  export default string;
}

declare module "*.wav" {
  export default string;
}

declare const helloWorld: RegExp;
export = helloWorld;
