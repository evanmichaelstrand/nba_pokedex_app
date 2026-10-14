import { logoRotation } from '../lib/rotation'
import './BackgroundLogo.css'

/** Large, faint logo behind the content. Turns a fixed step per navigation; never resets. */
export function BackgroundLogo({ netSteps }: { netSteps: number }) {
  return (
    <div className="background-logo" aria-hidden="true">
      <img
        className="background-logo-image"
        src={`${import.meta.env.BASE_URL}logo-bw.jpg`}
        alt=""
        style={{ transform: `rotate(${logoRotation(netSteps)}deg)` }}
      />
    </div>
  )
}
