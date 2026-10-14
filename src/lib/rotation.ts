/** Degrees the background logo turns per navigation step (next = +, previous = −). */
export const LOGO_ROTATION_STEP_DEG = 20

/** Cumulative logo angle after a net number of navigation steps. Never wraps back to 0. */
export function logoRotation(netSteps: number, stepDeg: number = LOGO_ROTATION_STEP_DEG): number {
  return netSteps * stepDeg
}
