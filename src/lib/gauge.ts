/**
 * Needle angle for a 0–1 value on a semicircle gauge, in degrees from straight up:
 * −90 points left (0%), 0 points up (50%), +90 points right (100%). Out-of-range values are clamped.
 */
export function gaugeAngle(fraction: number): number {
  const clamped = Math.min(1, Math.max(0, fraction))
  return -90 + clamped * 180
}
