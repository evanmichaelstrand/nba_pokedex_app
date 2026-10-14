import type { CSSProperties } from 'react'
import './ProgressSlider.css'

interface ProgressSliderProps {
  /** 0-based index of the current entry. */
  index: number
  total: number
  /** Name of the current entry, announced as the slider's value. */
  currentLabel: string
  onChange: (index: number) => void
  /** True while the user is dragging (so heavy work like image loading can wait). */
  onScrubbingChange: (scrubbing: boolean) => void
}

/** A native range input for flipping through the deck quickly. Arrow keys work on it when focused. */
export function ProgressSlider({ index, total, currentLabel, onChange, onScrubbingChange }: ProgressSliderProps) {
  if (total <= 1) return null
  const progress = (index / (total - 1)) * 100
  return (
    <input
      type="range"
      className="progress-slider"
      min={0}
      max={total - 1}
      step={1}
      value={index}
      aria-label="Flip through the Pokédex"
      aria-valuetext={`${index + 1} of ${total}: ${currentLabel}`}
      style={{ '--progress': `${progress}%` } as CSSProperties}
      onChange={(event) => onChange(Number(event.target.value))}
      onPointerDown={() => onScrubbingChange(true)}
    />
  )
}
