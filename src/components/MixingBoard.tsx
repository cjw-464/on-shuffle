'use client'

import { useState, useCallback, useEffect } from 'react'
import { Fader } from './Fader'
import { DialValues } from '@/lib/songSelection'

const FADER_CONFIG = [
  { id: 'production', label: 'Production', topLabel: 'Pop', bottomLabel: 'Roots' },
  { id: 'craft', label: 'Craft', topLabel: 'Virtuosic', bottomLabel: 'DIY' },
  { id: 'groove', label: 'Groove', topLabel: 'Pocket', bottomLabel: 'Straight' },
  { id: 'sonic_roots', label: 'Sonic Roots', topLabel: 'Big City', bottomLabel: 'Backwoods' },
  { id: 'mood', label: 'Mood', topLabel: 'Bright', bottomLabel: 'Dark' },
  { id: 'intensity', label: 'Intensity', topLabel: 'Intense', bottomLabel: 'Mellow' },
  { id: 'vibe', label: 'Vibe', topLabel: 'Out There', bottomLabel: 'Familiar' },
] as const

const DEFAULT_VALUES: DialValues = {
  production: 5,
  craft: 5,
  groove: 5,
  sonic_roots: 5,
  mood: 5,
  intensity: 5,
  vibe: 5,
}

interface MixingBoardProps {
  values?: DialValues
  onChange?: (values: DialValues) => void
  onManualChange?: () => void // Called when user manually adjusts a dial
  // Image-ready props for future artwork
  boardImage?: string
  trackImage?: string
  knobImage?: string
  className?: string
}

export function MixingBoard({
  values: externalValues,
  onChange,
  onManualChange,
  boardImage,
  trackImage,
  knobImage,
  className = '',
}: MixingBoardProps) {
  const [internalValues, setInternalValues] = useState<DialValues>(externalValues || DEFAULT_VALUES)

  // Sync with external values when they change (e.g., from preset selection)
  useEffect(() => {
    if (externalValues) {
      setInternalValues(externalValues)
    }
  }, [externalValues])

  const handleFaderChange = useCallback((faderId: keyof DialValues, newValue: number) => {
    setInternalValues(prev => {
      const updated = { ...prev, [faderId]: newValue }
      onChange?.(updated)
      return updated
    })
    // Signal that user manually adjusted a dial
    onManualChange?.()
  }, [onChange, onManualChange])

  const handleReset = () => {
    setInternalValues(DEFAULT_VALUES)
    onChange?.(DEFAULT_VALUES)
    onManualChange?.()
  }

  return (
    <div
      className={`rounded-2xl p-4 shadow-2xl border border-gray-800 ${className}`}
      style={{
        backgroundColor: boardImage ? 'transparent' : '#111827',
        backgroundImage: boardImage ? `url(${boardImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Mixing board header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Filter Mix
        </h2>
        <button
          onClick={handleReset}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800/50"
        >
          Reset
        </button>
      </div>

      {/* Channel strip container */}
      <div className="bg-gray-950/80 rounded-xl p-3 border border-gray-800/50 backdrop-blur-sm">
        {/* Faders row */}
        <div className="flex justify-center gap-1">
          {FADER_CONFIG.map(fader => (
            <Fader
              key={fader.id}
              id={fader.id}
              label={fader.label}
              topLabel={fader.topLabel}
              bottomLabel={fader.bottomLabel}
              value={internalValues[fader.id as keyof DialValues]}
              onChange={(newValue) => handleFaderChange(fader.id as keyof DialValues, newValue)}
              trackImage={trackImage}
              knobImage={knobImage}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { DEFAULT_VALUES }
