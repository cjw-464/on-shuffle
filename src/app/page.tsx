'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MixingBoard, DEFAULT_VALUES } from '@/components/MixingBoard'
import { MoodPresetBar } from '@/components/MoodPresetBar'
import { IPod } from '@/components/IPod'
import { SongActions } from '@/components/SongActions'
import { selectSong, DialValues } from '@/lib/songSelection'
import { Song } from '@/types/song'

export default function Home() {
  const [dialValues, setDialValues] = useState<DialValues>(DEFAULT_VALUES)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Song history for back/forward navigation
  const [songHistory, setSongHistory] = useState<Song[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Total matching songs (before exclusions)
  const [totalPoolSize, setTotalPoolSize] = useState(0)

  // Playlist (songs user explicitly added)
  const [playlist, setPlaylist] = useState<Song[]>([])

  // UI state
  const [isPlaying, setIsPlaying] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guard against double-fetch in StrictMode
  const hasFetchedInitial = useRef(false)

  // Current song is derived from history + index
  const currentSong = historyIndex >= 0 ? songHistory[historyIndex] : null
  const songsSeenCount = songHistory.length
  const canGoBack = historyIndex > 0
  // Can go forward if: navigating history, or no song yet, or more songs in pool
  const canGoForward = historyIndex < songHistory.length - 1 || historyIndex === -1 || totalPoolSize > songsSeenCount

  // Fetch a new song and add to history
  const fetchNewSong = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const excludeIds = songHistory.map(s => s.id)
      const result = await selectSong(dialValues, excludeIds)

      // Total pool = songs returned + songs already seen
      const totalMatching = result.poolSize + songHistory.length
      setTotalPoolSize(totalMatching)

      if (result.song) {
        setSongHistory(prev => [...prev, result.song!])
        setHistoryIndex(prev => prev + 1)
        setIsPlaying(true)
      } else if (result.allSongsShown) {
        setError('You\'ve seen all matching songs!')
      } else {
        setError('No songs match your dial settings.')
      }
    } catch (err) {
      console.error('Error selecting song:', err)
      setError('Failed to load song.')
    } finally {
      setIsLoading(false)
    }
  }, [dialValues, songHistory])

  // Auto-load first song on mount
  useEffect(() => {
    if (hasFetchedInitial.current) return
    hasFetchedInitial.current = true
    fetchNewSong()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle preset selection - sets dial values and marks preset as active
  const handlePresetSelect = useCallback((presetName: string | null, presetDialValues: DialValues | null) => {
    setActivePreset(presetName)
    if (presetDialValues) {
      setDialValues(presetDialValues)
    }
  }, [])

  // Handle manual dial change - updates values and clears active preset
  const handleDialChange = useCallback((newValues: DialValues) => {
    setDialValues(newValues)
  }, [])

  // Called when user manually adjusts a dial (not from preset)
  const handleManualDialChange = useCallback(() => {
    setActivePreset(null)
  }, [])

  // Skip forward: go to next in history, or fetch new song
  const handleSkipForward = useCallback(() => {
    if (historyIndex < songHistory.length - 1) {
      // Go forward in history
      setHistoryIndex(prev => prev + 1)
      setIsPlaying(true)
    } else {
      // Fetch new song
      fetchNewSong()
    }
  }, [historyIndex, songHistory.length, fetchNewSong])

  // Skip back: go to previous in history
  const handleSkipBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setIsPlaying(true)
    }
  }, [historyIndex])

  // Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Menu: reset session
  const handleMenu = useCallback(() => {
    setSongHistory([])
    setHistoryIndex(-1)
    setTotalPoolSize(0)
    setError(null)
    setIsPlaying(false)
  }, [])

  // Add to playlist
  const handleAddToPlaylist = useCallback((song: Song) => {
    setPlaylist(prev => {
      if (prev.some(s => s.id === song.id)) return prev
      return [...prev, song]
    })
  }, [])

  const isInPlaylist = currentSong ? playlist.some(s => s.id === currentSong.id) : false

  return (
    <main className="min-h-screen bg-gray-950 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">On Shuffle</h1>
          <p className="text-gray-400">Discover music with the 7-dial filter</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Filter Controls Container */}
          <div className="space-y-6">
            {/* Combined Mixing Board + Mood Presets Container */}
            <div className="rounded-2xl p-4 shadow-2xl border border-gray-800 bg-gray-900/50">
              <MixingBoard
                values={dialValues}
                onChange={handleDialChange}
                onManualChange={handleManualDialChange}
                className="border-0 shadow-none p-0"
              />

              {/* Mood Presets - inside same container */}
              <div className="mt-4 pt-4 border-t border-gray-800/50">
                <MoodPresetBar
                  onPresetSelect={handlePresetSelect}
                  activePreset={activePreset}
                />
              </div>
            </div>

            {/* Session Stats */}
            <div className="flex justify-between text-sm text-gray-500 px-2">
              <span>History: {songHistory.length} songs</span>
              <span>Playlist: {playlist.length}</span>
            </div>

            {/* Debug Info */}
            <details className="text-xs text-gray-600">
              <summary className="cursor-pointer hover:text-gray-400">
                Debug Info
              </summary>
              <pre className="mt-2 bg-gray-900 p-2 rounded overflow-x-auto">
                {JSON.stringify({
                  dialValues,
                  activePreset,
                  historyIndex,
                  historyLength: songHistory.length,
                  totalPoolSize,
                  canGoBack,
                  canGoForward,
                }, null, 2)}
              </pre>
            </details>
          </div>

          {/* Right: iPod + Actions */}
          <div className="flex flex-col items-center gap-6">
            {error ? (
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center max-w-md">
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={handleMenu}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Reset and try again
                </button>
              </div>
            ) : (
              <>
                <IPod
                  song={currentSong}
                  poolSize={totalPoolSize}
                  songsSeenCount={songsSeenCount}
                  isPlaying={isPlaying}
                  canGoBack={canGoBack}
                  canGoForward={canGoForward}
                  onSkipBack={handleSkipBack}
                  onSkipForward={handleSkipForward}
                  onPlayPause={handlePlayPause}
                  onMenu={handleMenu}
                />

                <SongActions
                  song={currentSong}
                  onAddToPlaylist={handleAddToPlaylist}
                  isInPlaylist={isInPlaylist}
                />
              </>
            )}
          </div>
        </div>

        {/* Playlist Preview */}
        {playlist.length > 0 && (
          <div className="mt-8 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-medium mb-3">Session Playlist ({playlist.length})</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {playlist.map(song => (
                <div
                  key={song.id}
                  className="flex-shrink-0 bg-gray-800 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-white">{song.title}</span>
                  <span className="text-gray-500 ml-2">— {song.artist}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
