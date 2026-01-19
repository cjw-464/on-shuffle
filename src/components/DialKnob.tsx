'use client'

import { useCallback, useRef, useEffect } from 'react'

interface DialKnobProps {
  label: string
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (value: number) => void
  id: string
}

export function DialKnob({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
  id,
}: DialKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastAngle = useRef(0)
  const accumulatedValue = useRef(0)

  // Map value (0-10) to rotation angle (-135° to +135°)
  const rotation = ((value / 10) * 270) - 135

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max)

  // Calculate angle from knob center to a point
  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return 0
    const rect = knobRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    // atan2 returns angle in radians, convert to degrees
    // Offset by 90° so that "up" is 0°
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90
    return angle
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    lastAngle.current = getAngle(e.clientX, e.clientY)
    accumulatedValue.current = value
    e.preventDefault()
  }, [value, getAngle])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true
    lastAngle.current = getAngle(e.touches[0].clientX, e.touches[0].clientY)
    accumulatedValue.current = value
  }, [value, getAngle])

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return

      const currentAngle = getAngle(clientX, clientY)
      let deltaAngle = currentAngle - lastAngle.current

      // Handle wrap-around at ±180°
      if (deltaAngle > 180) deltaAngle -= 360
      if (deltaAngle < -180) deltaAngle += 360

      // Convert angle delta to value delta (270° = full range of 10)
      const deltaValue = (deltaAngle / 270) * 10
      accumulatedValue.current = clamp(accumulatedValue.current + deltaValue, 0, 10)

      const newValue = Math.round(accumulatedValue.current)
      if (newValue !== value) {
        onChange(newValue)
      }

      lastAngle.current = currentAngle
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleEnd = () => {
      isDragging.current = false
    }

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
  }, [onChange, getAngle, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(clamp(value + 1, 0, 10))
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(clamp(value - 1, 0, 10))
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Main label */}
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-200 uppercase tracking-wider"
      >
        {label}
      </label>

      {/* Knob container */}
      <div className="flex items-center gap-3">
        {/* Left label */}
        <span className="text-xs text-gray-400 w-16 text-right">
          {leftLabel}
        </span>

        {/* Knob */}
        <div
          ref={knobRef}
          role="slider"
          tabIndex={0}
          id={id}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-label={`${label}: ${value}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          className="relative w-16 h-16 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full"
        >
          {/* Outer ring / track */}
          <div className="absolute inset-0 rounded-full bg-gray-800 border-4 border-gray-700 shadow-lg shadow-black/50" />

          {/* Inner knob face */}
          <div
            className="absolute inset-2 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-inner"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Indicator notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50" />
          </div>

          {/* Center cap */}
          <div className="absolute inset-4 rounded-full bg-gray-700 shadow-inner" />
        </div>

        {/* Right label */}
        <span className="text-xs text-gray-400 w-16">
          {rightLabel}
        </span>
      </div>

      {/* Value display */}
      <span className="text-xs text-gray-500 tabular-nums">
        {value}
      </span>
    </div>
  )
}
