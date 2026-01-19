'use client'

import { useState, useRef, useEffect } from 'react'
import { Song } from '@/types/song'

interface SongCardProps {
  song: Song
  onSkip: () => void
  onAddToPlaylist: (song: Song) => void
  isInPlaylist: boolean
}

export function SongCard({ song, onSkip, onAddToPlaylist, isInPlaylist }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAddedFeedback, setShowAddedFeedback] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Reset audio state when song changes
  useEffect(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [song.id])

  const handlePlaySpotify = () => {
    if (song.spotify_uri) {
      window.open(song.spotify_uri, '_blank')
    }
  }

  const handleAddToPlaylist = () => {
    if (!isInPlaylist) {
      onAddToPlaylist(song)
      setShowAddedFeedback(true)
      setTimeout(() => setShowAddedFeedback(false), 2000)
    }
  }

  const handleToggleRadioTag = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  // Determine if we should show radio tag (~1/3 of songs that have it)
  const showRadioTag = song.radio_tag_url && hashString(song.id) % 3 === 0

  return (
    <div className="max-w-md mx-auto">
      {/* iPod Device Container */}
      <div className="bg-gray-900 border-4 border-gray-700 rounded-3xl p-6 shadow-2xl">
        {/* Screen Bezel - Display Only */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-600">

          {/* Album Art Placeholder */}
          <div className="aspect-square bg-gray-800 rounded-xl mb-4 flex items-center justify-center border border-gray-700">
            <div className="text-gray-600">
              <MusicIcon className="w-24 h-24" />
            </div>
          </div>

          {/* Song Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white truncate mb-1">
              {song.title}
            </h2>
            <p className="text-gray-300 text-lg truncate">
              {song.artist}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {[song.album, song.year].filter(Boolean).join(' • ')}
            </p>
          </div>

          {/* Curator Notes */}
          {song.curator_notes && (
            <div className="bg-gray-950 rounded-lg p-3 mt-4 border border-gray-800">
              <p className="text-gray-400 text-sm italic leading-relaxed">
                &ldquo;{song.curator_notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Physical Controls - Outside Device */}
      <div className="mt-4 space-y-3">
        {/* Radio Tag Player */}
        {showRadioTag && song.radio_tag_url && (
          <div>
            <audio
              ref={audioRef}
              src={song.radio_tag_url}
              onEnded={handleAudioEnded}
              preload="none"
            />
            <button
              onClick={handleToggleRadioTag}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-900/30 hover:bg-purple-900/50 border-2 border-purple-800 rounded-xl text-purple-300 font-medium text-sm transition-colors"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-5 h-5" />
                  Pause DJ Intro
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  Play DJ Intro
                </>
              )}
            </button>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePlaySpotify}
            disabled={!song.spotify_uri}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 border-2 border-green-700 disabled:border-gray-700 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
          >
            <SpotifyIcon className="w-5 h-5" />
            Play
          </button>

          <button
            onClick={handleAddToPlaylist}
            disabled={isInPlaylist}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border-2 ${
              isInPlaylist || showAddedFeedback
                ? 'bg-blue-900/30 text-blue-400 border-blue-700'
                : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
            }`}
          >
            <PlusIcon className="w-5 h-5" />
            {showAddedFeedback ? 'Added!' : isInPlaylist ? 'In Playlist' : 'Add'}
          </button>

          <button
            onClick={onSkip}
            className="py-3 px-5 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center"
            aria-label="Skip to next song"
          >
            <SkipIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Simple hash function to deterministically show radio tag for ~1/3 of songs
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Icon Components
function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function SkipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}
