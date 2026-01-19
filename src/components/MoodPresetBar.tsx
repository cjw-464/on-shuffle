'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DialValues } from '@/lib/songSelection'

interface PresetOption {
  name: string
  description: string | null
  production: number
  craft: number
  groove: number
  sonic_roots: number
  mood: number
  intensity: number
  vibe: number
}

interface MoodPresetBarProps {
  onPresetSelect: (preset: string | null, dialValues: DialValues | null) => void
  activePreset: string | null // Controlled from parent
  className?: string
}

export function MoodPresetBar({ onPresetSelect, activePreset, className = '' }: MoodPresetBarProps) {
  const [allPresets, setAllPresets] = useState<PresetOption[]>([])
  const [displayedPresets, setDisplayedPresets] = useState<PresetOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)

  // Fetch all preset options with their dial values
  useEffect(() => {
    async function fetchPresets() {
      const { data, error } = await supabase
        .from('mood_preset_options')
        .select('name, description, production, craft, groove, sonic_roots, mood, intensity, vibe')

      if (error) {
        console.error('Error fetching mood presets:', error)
        setIsLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setIsLoading(false)
        return
      }

      setAllPresets(data)

      // Select up to 5 random presets to display
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, 5)
      setDisplayedPresets(selected)

      // Randomly highlight one as active on load
      if (selected.length > 0) {
        const randomPreset = selected[Math.floor(Math.random() * selected.length)]
        const dialValues = extractDialValues(randomPreset)
        onPresetSelect(randomPreset.name, dialValues)
      }

      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 600)
    }

    fetchPresets()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const extractDialValues = (preset: PresetOption): DialValues => ({
    production: preset.production,
    craft: preset.craft,
    groove: preset.groove,
    sonic_roots: preset.sonic_roots,
    mood: preset.mood,
    intensity: preset.intensity,
    vibe: preset.vibe,
  })

  const handlePresetClick = (preset: PresetOption) => {
    if (activePreset === preset.name) {
      // Click again to clear
      onPresetSelect(null, null)
    } else {
      // Activate this preset and pass dial values
      const dialValues = extractDialValues(preset)
      onPresetSelect(preset.name, dialValues)
    }
  }

  const handleShuffle = () => {
    if (allPresets.length <= 5) return

    setIsAnimating(true)

    const shuffled = [...allPresets].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 5)

    // Clear active if it's not in new selection
    if (activePreset && !selected.some(p => p.name === activePreset)) {
      onPresetSelect(null, null)
    }

    setDisplayedPresets(selected)
    setTimeout(() => setIsAnimating(false), 400)
  }

  // Hide if no presets available
  if (isLoading || displayedPresets.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Mood</span>
        {activePreset && (
          <button
            onClick={() => onPresetSelect(null, null)}
            className="text-[9px] text-gray-600 hover:text-gray-400 transition-colors"
          >
            Clear
          </button>
        )}
        {allPresets.length > 5 && (
          <button
            onClick={handleShuffle}
            className="text-[9px] text-gray-600 hover:text-gray-400 transition-colors ml-auto"
            title="Shuffle presets"
          >
            ↻ Shuffle
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {displayedPresets.map((preset, index) => (
          <PresetButton
            key={preset.name}
            label={preset.name}
            isActive={activePreset === preset.name}
            onClick={() => handlePresetClick(preset)}
            animationDelay={isAnimating ? index * 80 : 0}
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  )
}

function PresetButton({
  label,
  isActive,
  onClick,
  animationDelay,
  isAnimating,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  animationDelay: number
  isAnimating: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-3 py-1.5 rounded-md text-[10px] font-medium
        transition-all duration-150 ease-out
        border
        ${isActive
          ? 'bg-amber-900/60 text-amber-200 border-amber-600/80'
          : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700/80 hover:text-gray-300'
        }
        ${isAnimating ? 'animate-preset-appear' : ''}
      `}
      style={{
        boxShadow: isActive
          ? 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(245,158,11,0.4), 0 0 4px rgba(245,158,11,0.2)'
          : 'inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.2)',
        animationDelay: isAnimating ? `${animationDelay}ms` : '0ms',
      }}
    >
      {/* LED indicator */}
      <span
        className={`
          absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full
          transition-all duration-200
          ${isActive
            ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-led-pulse'
            : 'bg-gray-600'
          }
        `}
      />
      {label}
    </button>
  )
}
