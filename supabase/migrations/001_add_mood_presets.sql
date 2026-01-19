-- 1. Add mood_presets column to songs table with GIN index
ALTER TABLE songs
ADD COLUMN mood_presets TEXT[] DEFAULT '{}';

CREATE INDEX idx_songs_mood_presets ON songs USING GIN (mood_presets);

-- 2. Create mood_preset_options reference table with 12 initial presets
CREATE TABLE mood_preset_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO mood_preset_options (name, description) VALUES
  ('3AM on the porch', 'Late night contemplation, quiet solitude'),
  ('Missing someone specific', 'Longing, nostalgia, bittersweet memories'),
  ('Sunday morning pancakes', 'Warm, cozy, unhurried contentment'),
  ('Windows down highway', 'Freedom, movement, open road energy'),
  ('Getting ready to go out', 'Anticipation, building energy, excitement'),
  ('Rainy day inside', 'Introspective, calm, cocooned comfort'),
  ('Post-workout high', 'Energized, accomplished, endorphin rush'),
  ('Deep focus work', 'Concentration, flow state, productivity'),
  ('Backyard barbecue', 'Social, summer vibes, laid-back fun'),
  ('Midnight drive alone', 'Solitary, cinematic, emotionally open'),
  ('First coffee of the day', 'Awakening, ritual, gentle start'),
  ('Dancing in the kitchen', 'Joy, spontaneity, carefree movement');

-- 3. Update Umi Says with sample mood presets
UPDATE songs
SET mood_presets = ARRAY['3AM on the porch', 'Missing someone specific', 'Sunday morning pancakes']
WHERE title = 'Umi Says';
