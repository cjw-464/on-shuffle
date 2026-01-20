'use client'

import { useState, useRef, useEffect } from 'react'
import { Song } from '@/types/song'

// iPod Classic proportions based on authentic device
const IPOD = {
  width: 280,
  height: 469,
  cornerRadius: 14,
  topBezelPct: 6,
  screenPct: 38,
  midGapPct: 6,
  wheelPct: 42,
  bottomBezelPct: 8,
  contentWidthPct: 78,
  centerButtonPct: 38,
}

const screenWidth = IPOD.width * (IPOD.contentWidthPct / 100)
const screenHeight = IPOD.height * (IPOD.screenPct / 100)
const wheelZoneHeight = IPOD.height * (IPOD.wheelPct / 100)
const wheelDiameter = Math.min(wheelZoneHeight * 0.92, IPOD.width * 0.75)
const centerButtonDiameter = wheelDiameter * (IPOD.centerButtonPct / 100)

type DisplayMode = 'nowPlaying' | 'albumArt' | 'djTag' | 'visualizer'

interface MenuItem {
  id: DisplayMode
  label: string
  available: boolean
}

interface IPodProps {
  song: Song | null
  poolSize: number
  songsSeenCount: number
  isPlaying: boolean
  canGoBack: boolean
  canGoForward: boolean
  onSkipBack: () => void
  onSkipForward: () => void
  onPlayPause: () => void
  onMenu: () => void
  bodyImage?: string
  screenFrameImage?: string
  wheelImage?: string
  centerButtonImage?: string
}

export function IPod({
  song,
  poolSize,
  songsSeenCount,
  isPlaying,
  canGoBack,
  canGoForward,
  onSkipBack,
  onSkipForward,
  onPlayPause,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMenu, // Reserved for future session reset action
  bodyImage,
  screenFrameImage,
  wheelImage,
  centerButtonImage,
}: IPodProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('nowPlaying')
  const [isDjTagPlaying, setIsDjTagPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Build menu items based on song availability
  const menuItems: MenuItem[] = [
    { id: 'nowPlaying', label: 'Now Playing', available: true },
    { id: 'albumArt', label: 'Album Art', available: true },
    { id: 'djTag', label: 'DJ Tag', available: Boolean(song?.radio_tag_url) },
    { id: 'visualizer', label: 'Visualizer', available: Boolean(song?.motion_graphic_url) },
  ]

  const availableItems = menuItems.filter(item => item.available)

  // Reset state when song changes
  useEffect(() => {
    setDisplayMode('nowPlaying')
    setIsMenuOpen(false)
    setHighlightedIndex(0)
    setIsDjTagPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [song?.id])

  // Handle menu button
  const handleMenuClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    } else {
      setIsMenuOpen(true)
      setHighlightedIndex(0)
    }
  }

  // Handle navigation (up/down in menu, or skip songs when not in menu)
  const handleNavigateUp = () => {
    if (isMenuOpen) {
      setHighlightedIndex(prev => Math.max(0, prev - 1))
    } else {
      onSkipBack()
    }
  }

  const handleNavigateDown = () => {
    if (isMenuOpen) {
      setHighlightedIndex(prev => Math.min(availableItems.length - 1, prev + 1))
    } else {
      onSkipForward()
    }
  }

  // Handle center button (select in menu, or toggle motion graphic when not in menu)
  const handleCenterClick = () => {
    if (isMenuOpen) {
      const selectedItem = availableItems[highlightedIndex]
      if (selectedItem) {
        selectDisplayMode(selectedItem.id)
      }
    } else {
      // When not in menu, center button could toggle back to album art or do nothing
      // For now, let's open the menu
      setIsMenuOpen(true)
      setHighlightedIndex(0)
    }
  }

  const selectDisplayMode = (mode: DisplayMode) => {
    // Stop any playing audio when switching modes
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsDjTagPlaying(false)

    setDisplayMode(mode)
    setIsMenuOpen(false)

    // Start DJ tag audio if that mode is selected
    if (mode === 'djTag' && song?.radio_tag_url && audioRef.current) {
      audioRef.current.src = song.radio_tag_url
      audioRef.current.play()
      setIsDjTagPlaying(true)
    }
  }

  const handleAudioEnded = () => {
    setIsDjTagPlaying(false)
  }

  const toggleDjTagPlayback = () => {
    if (!audioRef.current) return
    if (isDjTagPlaying) {
      audioRef.current.pause()
      setIsDjTagPlaying(false)
    } else {
      audioRef.current.play()
      setIsDjTagPlaying(true)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hidden audio element for DJ intro */}
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      {/* iPod Device */}
      <div
        className="relative"
        style={{
          width: IPOD.width,
          height: IPOD.height,
          borderRadius: IPOD.cornerRadius,
          background: bodyImage
            ? `url(${bodyImage}) center/cover`
            : 'linear-gradient(180deg, #4A4A4A 0%, #3A3A3A 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.2)',
        }}
      >
        {/* Gloss overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: IPOD.cornerRadius,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
          }}
        />

        {/* Screen area */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: IPOD.height * (IPOD.topBezelPct / 100),
            width: screenWidth,
            height: screenHeight,
          }}
        >
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background: screenFrameImage ? `url(${screenFrameImage}) center/cover` : '#0a0a0a',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
              borderRadius: screenWidth * 0.02,
            }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                top: '5%',
                left: '5%',
                right: '5%',
                bottom: '5%',
                borderRadius: screenWidth * 0.015,
                backgroundColor: '#1a1a1a',
              }}
            >
              {!song ? (
                <EmptyScreen />
              ) : isMenuOpen ? (
                <MenuScreen
                  items={availableItems}
                  highlightedIndex={highlightedIndex}
                  onSelect={selectDisplayMode}
                />
              ) : displayMode === 'nowPlaying' ? (
                <NowPlayingScreen
                  song={song}
                  poolSize={poolSize}
                  songsSeenCount={songsSeenCount}
                  isPlaying={isPlaying}
                />
              ) : displayMode === 'albumArt' ? (
                <FullAlbumArtScreen song={song} />
              ) : displayMode === 'djTag' ? (
                <DJTagScreen
                  song={song}
                  isPlaying={isDjTagPlaying}
                  onTogglePlay={toggleDjTagPlayback}
                />
              ) : (
                <VisualizerScreen url={song.motion_graphic_url!} />
              )}
            </div>
          </div>
        </div>

        {/* Click Wheel */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: IPOD.height * ((IPOD.topBezelPct + IPOD.screenPct + IPOD.midGapPct) / 100) + (wheelZoneHeight - wheelDiameter) / 2,
            width: wheelDiameter,
            height: wheelDiameter,
          }}
        >
          <ClickWheel
            onMenu={handleMenuClick}
            onUp={handleNavigateUp}
            onDown={handleNavigateDown}
            onPlayPause={onPlayPause}
            onCenterClick={handleCenterClick}
            canGoUp={isMenuOpen ? highlightedIndex > 0 : canGoBack}
            canGoDown={isMenuOpen ? highlightedIndex < availableItems.length - 1 : canGoForward}
            wheelImage={wheelImage}
            centerButtonImage={centerButtonImage}
            diameter={wheelDiameter}
            centerDiameter={centerButtonDiameter}
          />
        </div>
      </div>
    </div>
  )
}

// ============ Screen Components ============

function MenuScreen({
  items,
  highlightedIndex,
  onSelect,
}: {
  items: MenuItem[]
  highlightedIndex: number
  onSelect: (id: DisplayMode) => void
}) {
  return (
    <div className="h-full flex flex-col text-white bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-gray-600 to-gray-700 border-b border-gray-500">
        <span className="text-[10px] font-semibold">Views</span>
        <ChevronIcon className="w-2.5 h-2.5 text-gray-400" />
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
              index === highlightedIndex
                ? 'bg-blue-500 text-white'
                : 'text-gray-200 hover:bg-gray-700'
            }`}
          >
            <span className="text-[11px] font-medium">{item.label}</span>
            {index === highlightedIndex && (
              <ChevronRightIcon className="w-3 h-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function NowPlayingScreen({
  song,
  poolSize,
  songsSeenCount,
  isPlaying,
}: {
  song: Song
  poolSize: number
  songsSeenCount: number
  isPlaying: boolean
}) {
  return (
    <div className="h-full flex flex-col text-white bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-gray-600 to-gray-700 border-b border-gray-500">
        <span className="text-[10px] font-semibold">Now Playing</span>
        <div className="flex items-center gap-1.5">
          <ShuffleIcon className="w-2.5 h-2.5 text-gray-300" />
          {isPlaying ? (
            <PlayingIcon className="w-2.5 h-2.5 text-gray-300" />
          ) : (
            <PausedIcon className="w-2.5 h-2.5 text-gray-300" />
          )}
          <BatteryIcon className="w-4 h-2.5 text-gray-300" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Album Art */}
        <div className="w-24 h-24 flex-shrink-0 bg-gray-800 rounded border border-gray-600 flex items-center justify-center shadow-inner">
          <MusicNoteIcon className="w-10 h-10 text-gray-600" />
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
          <h2 className="text-[11px] font-bold truncate leading-tight">
            {song.title}
          </h2>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">
            {song.artist}
          </p>
          <p className="text-[9px] text-gray-500 truncate mt-0.5">
            {song.album || 'Unknown Album'}
          </p>
          <p className="text-[9px] text-gray-500 mt-1">
            {songsSeenCount} of {poolSize}
          </p>
        </div>
      </div>
    </div>
  )
}

function FullAlbumArtScreen({ song }: { song: Song }) {
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      {/* Placeholder for album art - will use actual image when available */}
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="text-center">
          <MusicNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-2" />
          <p className="text-[10px] text-gray-500">{song.album || song.title}</p>
        </div>
      </div>
    </div>
  )
}

function DJTagScreen({
  song,
  isPlaying,
  onTogglePlay,
}: {
  song: Song
  isPlaying: boolean
  onTogglePlay: () => void
}) {
  return (
    <div className="h-full flex flex-col text-white bg-gradient-to-b from-purple-900 to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-purple-700 to-purple-800 border-b border-purple-600">
        <span className="text-[10px] font-semibold">DJ Tag</span>
        <div className="flex items-center gap-1.5">
          {isPlaying && <SoundWaveIcon className="w-4 h-2.5 text-purple-300" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className="w-16 h-16 rounded-full bg-purple-800 border-2 border-purple-500 flex items-center justify-center mb-3 cursor-pointer hover:bg-purple-700 transition-colors"
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <PausedIcon className="w-8 h-8 text-purple-200" />
          ) : (
            <PlayingIcon className="w-8 h-8 text-purple-200" />
          )}
        </div>
        <p className="text-[11px] font-medium text-center truncate w-full">
          {song.title}
        </p>
        <p className="text-[10px] text-purple-300 text-center truncate w-full mt-0.5">
          {song.artist}
        </p>
        <p className="text-[9px] text-purple-400 mt-2">
          {isPlaying ? 'Playing...' : 'Tap to play'}
        </p>
      </div>
    </div>
  )
}

function VisualizerScreen({ url }: { url: string }) {
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <img
        src={url}
        alt="Visualizer"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )
}

function EmptyScreen() {
  return (
    <div className="h-full flex flex-col text-white bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-gray-600 to-gray-700 border-b border-gray-500">
        <span className="text-[10px] font-semibold">On Shuffle</span>
        <div className="flex items-center gap-1.5">
          <ShuffleIcon className="w-2.5 h-2.5 text-gray-300" />
          <PausedIcon className="w-2.5 h-2.5 text-gray-300" />
          <BatteryIcon className="w-4 h-2.5 text-gray-300" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MusicNoteIcon className="w-8 h-8 text-gray-600 mx-auto mb-1" />
          <p className="text-[10px] text-gray-500">Loading...</p>
        </div>
      </div>
    </div>
  )
}

// ============ Click Wheel ============

function ClickWheel({
  onMenu,
  onUp,
  onDown,
  onPlayPause,
  onCenterClick,
  canGoUp,
  canGoDown,
  wheelImage,
  centerButtonImage,
  diameter,
  centerDiameter,
}: {
  onMenu: () => void
  onUp: () => void
  onDown: () => void
  onPlayPause: () => void
  onCenterClick: () => void
  canGoUp: boolean
  canGoDown: boolean
  wheelImage?: string
  centerButtonImage?: string
  diameter: number
  centerDiameter: number
}) {
  const textSize = diameter * 0.055
  const wheelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastAngle = useRef(0)
  const accumulatedRotation = useRef(0)
  const ROTATION_THRESHOLD = 30 // degrees needed to trigger navigation

  // Calculate angle from center of wheel
  const getAngle = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI)
  }

  // Check if point is in the wheel ring (not center button)
  const isInWheelRing = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return false
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
    )
    const outerRadius = diameter / 2
    const innerRadius = centerDiameter / 2 + 10 // Add buffer
    return distance > innerRadius && distance < outerRadius
  }

  const handleWheelStart = (clientX: number, clientY: number) => {
    if (!isInWheelRing(clientX, clientY)) return
    isDragging.current = true
    lastAngle.current = getAngle(clientX, clientY)
    accumulatedRotation.current = 0
  }

  const handleWheelMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return

    const currentAngle = getAngle(clientX, clientY)
    let delta = currentAngle - lastAngle.current

    // Handle angle wrap-around
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360

    accumulatedRotation.current += delta
    lastAngle.current = currentAngle

    // Trigger navigation based on accumulated rotation
    if (accumulatedRotation.current >= ROTATION_THRESHOLD) {
      onDown() // Clockwise = forward/down
      accumulatedRotation.current = 0
    } else if (accumulatedRotation.current <= -ROTATION_THRESHOLD) {
      onUp() // Counter-clockwise = back/up
      accumulatedRotation.current = 0
    }
  }

  const handleWheelEnd = () => {
    isDragging.current = false
    accumulatedRotation.current = 0
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleWheelMove(e.clientX, e.clientY)
    const handleMouseUp = () => handleWheelEnd()
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleWheelMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const handleTouchEnd = () => handleWheelEnd()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUp, onDown])

  return (
    <div
      ref={wheelRef}
      className="relative rounded-full"
      style={{
        width: diameter,
        height: diameter,
        background: wheelImage
          ? `url(${wheelImage}) center/cover`
          : 'radial-gradient(circle at 30% 30%, #3a3a3a 0%, #2D2D2D 50%, #252525 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: 'grab',
      }}
      onMouseDown={(e) => handleWheelStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handleWheelStart(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
    >
      {/* Menu (top) */}
      <button
        onClick={onMenu}
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center hover:brightness-125 transition-all"
        style={{
          top: diameter * 0.08,
          width: diameter * 0.35,
          height: diameter * 0.18,
          fontSize: textSize,
          color: '#888888',
          fontWeight: 500,
        }}
      >
        MENU
      </button>

      {/* Up / Skip Back (left) */}
      <button
        onClick={onUp}
        disabled={!canGoUp}
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center disabled:opacity-30 hover:brightness-125 transition-all"
        style={{
          left: diameter * 0.06,
          width: diameter * 0.18,
          height: diameter * 0.35,
        }}
      >
        <SkipBackIcon style={{ width: diameter * 0.1, height: diameter * 0.1, color: '#888888' }} />
      </button>

      {/* Down / Skip Forward (right) */}
      <button
        onClick={onDown}
        disabled={!canGoDown}
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center disabled:opacity-30 hover:brightness-125 transition-all"
        style={{
          right: diameter * 0.06,
          width: diameter * 0.18,
          height: diameter * 0.35,
        }}
      >
        <SkipForwardIcon style={{ width: diameter * 0.1, height: diameter * 0.1, color: '#888888' }} />
      </button>

      {/* Play/Pause (bottom) */}
      <button
        onClick={onPlayPause}
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center hover:brightness-125 transition-all"
        style={{
          bottom: diameter * 0.08,
          width: diameter * 0.35,
          height: diameter * 0.18,
        }}
      >
        <PlayPauseIcon style={{ width: diameter * 0.1, height: diameter * 0.1, color: '#888888' }} />
      </button>

      {/* Center button */}
      <button
        onClick={onCenterClick}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all active:brightness-90"
        style={{
          width: centerDiameter,
          height: centerDiameter,
          background: centerButtonImage
            ? `url(${centerButtonImage}) center/cover`
            : 'radial-gradient(circle at 40% 40%, #2a2a2a 0%, #1F1F1F 70%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
        }}
        aria-label="Select"
      />
    </div>
  )
}

// ============ Icons ============

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 10" fill="currentColor">
      <rect x="0" y="0" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="1.5" y="1.5" width="5" height="7" rx="0.5" fill="currentColor" />
      <rect x="16" y="2.5" width="2.5" height="5" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  )
}

function PlayingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PausedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}

function MusicNoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

function SoundWaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 12" fill="currentColor">
      <rect x="1" y="4" width="2" height="4" rx="0.5" />
      <rect x="5" y="2" width="2" height="8" rx="0.5" />
      <rect x="9" y="0" width="2" height="12" rx="0.5" />
      <rect x="13" y="2" width="2" height="8" rx="0.5" />
      <rect x="17" y="4" width="2" height="4" rx="0.5" />
      <rect x="21" y="3" width="2" height="6" rx="0.5" />
    </svg>
  )
}

function SkipBackIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

function SkipForwardIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function PlayPauseIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
