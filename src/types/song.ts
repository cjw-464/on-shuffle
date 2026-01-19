export interface Song {
  id: string
  title: string
  artist: string
  album: string | null
  year: number | null
  spotify_uri: string | null

  // Dial scores (0-10)
  production: number
  craft: number
  groove: number
  sonic_roots: number
  mood: number
  intensity: number
  vibe: number

  // Content
  curator_notes: string | null
  written_story: string | null
  discovery_context: string | null
  radio_tag_url: string | null
  family_only: boolean

  created_at: string
  updated_at: string
}

export type DialKey = 'production' | 'craft' | 'groove' | 'sonic_roots' | 'mood' | 'intensity' | 'vibe'

export const DIAL_KEYS: DialKey[] = [
  'production',
  'craft',
  'groove',
  'sonic_roots',
  'mood',
  'intensity',
  'vibe',
]
