'use client'

import { useState } from 'react'
import { Song } from '@/types/song'

interface SongActionsProps {
  song: Song | null
  onAddToPlaylist: (song: Song) => void
  isInPlaylist: boolean
}

export function SongActions({ song, onAddToPlaylist, isInPlaylist }: SongActionsProps) {
  const [showAddedFeedback, setShowAddedFeedback] = useState(false)

  const handlePlaySpotify = () => {
    if (song?.spotify_uri) {
      window.open(song.spotify_uri, '_blank')
    }
  }

  const handleAddToPlaylist = () => {
    if (song && !isInPlaylist) {
      onAddToPlaylist(song)
      setShowAddedFeedback(true)
      setTimeout(() => setShowAddedFeedback(false), 2000)
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handlePlaySpotify}
        disabled={!song?.spotify_uri}
        className="py-3 px-6 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 border-2 border-green-700 disabled:border-gray-700 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
      >
        <SpotifyIcon className="w-5 h-5" />
        Play on Spotify
      </button>

      <button
        onClick={handleAddToPlaylist}
        disabled={!song || isInPlaylist}
        className={`py-3 px-6 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border-2 ${
          isInPlaylist || showAddedFeedback
            ? 'bg-blue-900/30 text-blue-400 border-blue-700'
            : song
            ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
            : 'bg-gray-800 text-gray-600 border-gray-700'
        }`}
      >
        <PlusIcon className="w-5 h-5" />
        {showAddedFeedback ? 'Added!' : isInPlaylist ? 'In Playlist' : 'Add to Playlist'}
      </button>
    </div>
  )
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
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
