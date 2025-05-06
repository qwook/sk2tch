import { Color } from "three";

export type Range<T = number> = [T, T];

/**
 *
 * @param {*} value
 * @param {*} srcRange
 * @param {*} dstRange
 */

export default function map(value, srcRange: Range, dstRange: Range): number {
  const offset = value - srcRange[0];
  const length = srcRange[1] - srcRange[0];
  const ratio = offset / length;

  return (dstRange[1] - dstRange[0]) * ratio + dstRange[0];
}

export function mapColor(
  value,
  srcRange: Range,
  dstColorRange: Range<Color>
): Color {
  return new Color().lerpColors(...dstColorRange, map(value, srcRange, [0, 1]));
}
