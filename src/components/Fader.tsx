'use client'

import { useCallback, useRef, useEffect } from 'react'

interface FaderProps {
  label: string
  topLabel: string
  bottomLabel: string
  value: number
  onChange: (value: number) => void
  id: string
  // Image-ready props for future artwork
  trackImage?: string
  knobImage?: string
  className?: string
}

const TRACK_HEIGHT = 140
const KNOB_HEIGHT = 28
const USABLE_TRACK = TRACK_HEIGHT - KNOB_HEIGHT // Space knob can travel

export function Fader({
  label,
  topLabel,
  bottomLabel,
  value,
  onChange,
  id,
  trackImage,
  knobImage,
  className = '',
}: FaderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max)

  // Convert Y position to value (0-10)
  const positionToValue = useCallback((clientY: number) => {
    if (!trackRef.current) return value
    const rect = trackRef.current.getBoundingClientRect()

    // Usable range excludes half knob height at top and bottom
    const topBound = rect.top + KNOB_HEIGHT / 2
    const bottomBound = rect.bottom - KNOB_HEIGHT / 2
    const usableHeight = bottomBound - topBound

    const relativeY = clientY - topBound
    const percentage = 1 - (relativeY / usableHeight) // Invert: top = 10, bottom = 0
    return clamp(Math.round(percentage * 10), 0, 10)
  }, [value])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    onChange(positionToValue(e.clientY))
    e.preventDefault()
  }, [positionToValue, onChange])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true
    onChange(positionToValue(e.touches[0].clientY))
  }, [positionToValue, onChange])

  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!isDragging.current) return
      onChange(positionToValue(clientY))
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY)
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY)
    const handleEnd = () => { isDragging.current = false }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [positionToValue, onChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(clamp(value + 1, 0, 10))
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(clamp(value - 1, 0, 10))
    }
  }

  // Knob position: value 0 = bottom, value 10 = top
  // Position is from BOTTOM of track
  const knobBottomPx = (value / 10) * USABLE_TRACK

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ width: 56 }}>
      {/* Channel name */}
      <label
        htmlFor={id}
        className="text-[9px] font-bold text-gray-300 uppercase tracking-wide text-center leading-tight"
        style={{ minHeight: 24 }}
      >
        {label}
      </label>

      {/* Top label (high value = 10) */}
      <span className="text-[8px] text-gray-500 text-center leading-tight" style={{ minHeight: 20 }}>
        {topLabel}
      </span>

      {/* Fader track container - image-ready */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        id={id}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-label={`${label}: ${value}`}
        aria-orientation="vertical"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        className="relative cursor-ns-resize focus:outline-none focus:ring-2 focus:ring-blue-500 rounded select-none"
        style={{
          width: 32,
          height: TRACK_HEIGHT,
          backgroundImage: trackImage ? `url(${trackImage})` : undefined,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Default track groove (hidden if trackImage provided) */}
        {!trackImage && (
          <>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-1.5 bg-gray-800 rounded-full shadow-inner border border-gray-700"
              style={{ top: KNOB_HEIGHT / 2, bottom: KNOB_HEIGHT / 2 }}
            />
            {/* Center line marker */}
            <div
              className="absolute left-1 right-1 h-0.5 bg-gray-500"
              style={{ bottom: TRACK_HEIGHT / 2 }}
            />
          </>
        )}

        {/* Fader knob - image-ready */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: knobBottomPx,
            width: 24,
            height: KNOB_HEIGHT,
            backgroundImage: knobImage ? `url(${knobImage})` : undefined,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          {/* Default knob (hidden if knobImage provided) */}
          {!knobImage && (
            <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-400 rounded-sm shadow-lg border border-gray-500 flex items-center justify-center">
              <div className="w-3 space-y-0.5">
                <div className="h-px bg-gray-500" />
                <div className="h-px bg-gray-500" />
                <div className="h-px bg-gray-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom label (low value = 0) */}
      <span className="text-[8px] text-gray-500 text-center leading-tight" style={{ minHeight: 20 }}>
        {bottomLabel}
      </span>

      {/* Value display */}
      <span className="text-[9px] text-gray-600 tabular-nums">
        {value}
      </span>
    </div>
  )
}
