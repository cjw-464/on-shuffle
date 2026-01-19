import { supabase } from './supabase'
import { Song, DialKey, DIAL_KEYS } from '@/types/song'

export interface DialValues {
  production: number
  craft: number
  groove: number
  sonic_roots: number
  mood: number
  intensity: number
  vibe: number
}

interface SongWithScore {
  song: Song
  fitScore: number
}

/**
 * Calculate the fit score for a song given user dial settings.
 * Lower score = better match. Range: 0 (perfect) to 14+ (poor match).
 */
function calculateFitScore(song: Song, userDials: DialValues): number {
  return DIAL_KEYS.reduce((score, key) => {
    const songValue = song[key]
    const userValue = userDials[key as keyof DialValues]
    return score + Math.abs(songValue - userValue)
  }, 0)
}

/**
 * Check if a dial is set to an extreme value (0 or 10).
 */
function isExtremeDial(value: number): boolean {
  return value === 0 || value === 10
}

/**
 * Get dial keys sorted by whether they're extreme (non-extreme first).
 * This determines widening order.
 */
function getDialsByPriority(userDials: DialValues): DialKey[] {
  const nonExtreme: DialKey[] = []
  const extreme: DialKey[] = []

  for (const key of DIAL_KEYS) {
    if (isExtremeDial(userDials[key as keyof DialValues])) {
      extreme.push(key)
    } else {
      nonExtreme.push(key)
    }
  }

  return [...nonExtreme, ...extreme]
}

/**
 * Build Supabase query with dial range filters.
 */
async function querySongsInRange(
  userDials: DialValues,
  tolerances: Record<DialKey, number>,
  excludeIds: string[]
): Promise<Song[]> {
  let query = supabase.from('songs').select('*')

  // Apply range filter for each dial
  for (const key of DIAL_KEYS) {
    const userValue = userDials[key as keyof DialValues]
    const tolerance = tolerances[key]
    const min = Math.max(0, userValue - tolerance)
    const max = Math.min(10, userValue + tolerance)
    query = query.gte(key, min).lte(key, max)
  }

  // Exclude already-shown songs
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error querying songs:', error)
    return []
  }

  return data as Song[]
}

/**
 * Select a random song weighted by fit score.
 * Lower fit scores are more likely to be selected.
 */
function weightedRandomSelect(songsWithScores: SongWithScore[]): Song | null {
  if (songsWithScores.length === 0) return null
  if (songsWithScores.length === 1) return songsWithScores[0].song

  // Calculate weights: weight = 1 / (fitScore + 1)
  // This gives perfect matches (score=0) a weight of 1,
  // score=1 gets 0.5, score=2 gets 0.33, etc.
  const weights = songsWithScores.map(({ fitScore }) => 1 / (fitScore + 1))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  // Random selection based on weights
  let random = Math.random() * totalWeight
  for (let i = 0; i < songsWithScores.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return songsWithScores[i].song
    }
  }

  // Fallback (shouldn't reach here)
  return songsWithScores[songsWithScores.length - 1].song
}

export interface SelectionResult {
  song: Song | null
  fitScore: number | null
  poolSize: number
  toleranceUsed: number
  allSongsShown: boolean
}

/**
 * Main song selection function.
 * Returns a weighted-random song matching the user's dial settings.
 */
export async function selectSong(
  userDials: DialValues,
  excludeIds: string[],
  maxTolerance: number = 5
): Promise<SelectionResult> {
  const dialsByPriority = getDialsByPriority(userDials)

  // Start with base tolerance of 2 for all dials
  const tolerances: Record<DialKey, number> = {} as Record<DialKey, number>
  for (const key of DIAL_KEYS) {
    tolerances[key] = 2
  }

  // Try with initial tolerance
  let songs = await querySongsInRange(userDials, tolerances, excludeIds)

  // If no matches, progressively widen tolerances
  let currentTolerance = 2
  let dialIndex = 0

  while (songs.length === 0 && currentTolerance <= maxTolerance) {
    // Widen the next dial in priority order
    const dialToWiden = dialsByPriority[dialIndex]
    tolerances[dialToWiden] = currentTolerance + 1

    dialIndex++

    // If we've widened all dials at this level, move to next tolerance level
    if (dialIndex >= DIAL_KEYS.length) {
      dialIndex = 0
      currentTolerance++
      // Reset all tolerances to new level (non-extreme first approach already applied)
      for (const key of dialsByPriority.slice(0, dialsByPriority.length)) {
        if (!isExtremeDial(userDials[key as keyof DialValues]) || currentTolerance > 3) {
          tolerances[key] = currentTolerance
        }
      }
    }

    songs = await querySongsInRange(userDials, tolerances, excludeIds)
  }

  // Check if all songs have been shown (query without exclusions)
  if (songs.length === 0) {
    const allSongs = await querySongsInRange(userDials, tolerances, [])
    if (allSongs.length > 0) {
      return {
        song: null,
        fitScore: null,
        poolSize: 0,
        toleranceUsed: currentTolerance,
        allSongsShown: true,
      }
    }
  }

  if (songs.length === 0) {
    return {
      song: null,
      fitScore: null,
      poolSize: 0,
      toleranceUsed: currentTolerance,
      allSongsShown: false,
    }
  }

  // Calculate fit scores for all matching songs
  const songsWithScores: SongWithScore[] = songs.map(song => ({
    song,
    fitScore: calculateFitScore(song, userDials),
  }))

  // Sort by fit score for logging/debugging
  songsWithScores.sort((a, b) => a.fitScore - b.fitScore)

  // Select weighted random song
  const selected = weightedRandomSelect(songsWithScores)
  const selectedScore = selected
    ? songsWithScores.find(s => s.song.id === selected.id)?.fitScore ?? null
    : null

  return {
    song: selected,
    fitScore: selectedScore,
    poolSize: songs.length,
    toleranceUsed: Math.max(...Object.values(tolerances)),
    allSongsShown: false,
  }
}

/**
 * Reset session by clearing the shown songs list.
 * (This is just a helper - actual state lives in React component)
 */
export function createSessionState() {
  return {
    shownSongIds: new Set<string>(),
    addShownSong(id: string) {
      this.shownSongIds.add(id)
    },
    reset() {
      this.shownSongIds.clear()
    },
    getExcludeIds(): string[] {
      return Array.from(this.shownSongIds)
    },
  }
}
