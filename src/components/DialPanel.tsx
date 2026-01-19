'use client'

import { useState, useCallback } from 'react'
import { DialKnob } from './DialKnob'

export interface DialValues {
  production: number
  craft: number
  groove: number
  sonicRoots: number
  mood: number
  intensity: number
  vibe: number
}

const DIAL_CONFIG = [
  { id: 'production', label: 'Production', leftLabel: 'Roots', rightLabel: 'Pop' },
  { id: 'craft', label: 'Craft', leftLabel: 'DIY', rightLabel: 'Virtuosic' },
  { id: 'groove', label: 'Groove', leftLabel: 'Straight', rightLabel: 'Pocket' },
  { id: 'sonicRoots', label: 'Sonic Roots', leftLabel: 'Backwoods', rightLabel: 'Big City' },
  { id: 'mood', label: 'Mood', leftLabel: 'Dark', rightLabel: 'Bright' },
  { id: 'intensity', label: 'Intensity', leftLabel: 'Mellow', rightLabel: 'Intense' },
  { id: 'vibe', label: 'Vibe', leftLabel: 'Familiar', rightLabel: 'Out There' },
] as const

const DEFAULT_VALUES: DialValues = {
  production: 5,
  craft: 5,
  groove: 5,
  sonicRoots: 5,
  mood: 5,
  intensity: 5,
  vibe: 5,
}

interface DialPanelProps {
  onChange?: (values: DialValues) => void
}

export function DialPanel({ onChange }: DialPanelProps) {
  const [values, setValues] = useState<DialValues>(DEFAULT_VALUES)

  const handleDialChange = useCallback((dialId: keyof DialValues, newValue: number) => {
    setValues(prev => {
      const updated = { ...prev, [dialId]: newValue }
      onChange?.(updated)
      return updated
    })
  }, [onChange])

  const handleReset = () => {
    setValues(DEFAULT_VALUES)
    onChange?.(DEFAULT_VALUES)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-100">
          Filter Dials
        </h2>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-3 py-1 rounded-md hover:bg-gray-800"
        >
          Reset All
        </button>
      </div>

      {/* Dials grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {DIAL_CONFIG.map(dial => (
          <DialKnob
            key={dial.id}
            id={dial.id}
            label={dial.label}
            leftLabel={dial.leftLabel}
            rightLabel={dial.rightLabel}
            value={values[dial.id as keyof DialValues]}
            onChange={(newValue) => handleDialChange(dial.id as keyof DialValues, newValue)}
          />
        ))}
      </div>

      {/* Debug output - can be removed later */}
      <details className="mt-6">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
          Debug: Current Values
        </summary>
        <pre className="mt-2 text-xs text-gray-600 bg-gray-950 p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(values, null, 2)}
        </pre>
      </details>
    </div>
  )
}
