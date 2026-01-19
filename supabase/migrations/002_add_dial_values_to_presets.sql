-- Add dial value columns to mood_preset_options
ALTER TABLE mood_preset_options
ADD COLUMN production INTEGER DEFAULT 5,
ADD COLUMN craft INTEGER DEFAULT 5,
ADD COLUMN groove INTEGER DEFAULT 5,
ADD COLUMN sonic_roots INTEGER DEFAULT 5,
ADD COLUMN mood INTEGER DEFAULT 5,
ADD COLUMN intensity INTEGER DEFAULT 5,
ADD COLUMN vibe INTEGER DEFAULT 5;

-- Update existing presets with dial values
-- These are starting suggestions - adjust as needed

UPDATE mood_preset_options SET
  production = 3, craft = 4, groove = 6, sonic_roots = 7, mood = 3, intensity = 2, vibe = 4
WHERE name = '3AM on the porch';

UPDATE mood_preset_options SET
  production = 5, craft = 6, groove = 5, sonic_roots = 5, mood = 3, intensity = 4, vibe = 5
WHERE name = 'Missing someone specific';

UPDATE mood_preset_options SET
  production = 6, craft = 5, groove = 7, sonic_roots = 6, mood = 8, intensity = 3, vibe = 4
WHERE name = 'Sunday morning pancakes';

UPDATE mood_preset_options SET
  production = 7, craft = 5, groove = 8, sonic_roots = 5, mood = 8, intensity = 7, vibe = 5
WHERE name = 'Windows down highway';

UPDATE mood_preset_options SET
  production = 8, craft = 5, groove = 8, sonic_roots = 4, mood = 8, intensity = 8, vibe = 6
WHERE name = 'Getting ready to go out';

UPDATE mood_preset_options SET
  production = 4, craft = 6, groove = 4, sonic_roots = 6, mood = 4, intensity = 3, vibe = 5
WHERE name = 'Rainy day inside';

UPDATE mood_preset_options SET
  production = 8, craft = 4, groove = 9, sonic_roots = 4, mood = 8, intensity = 9, vibe = 5
WHERE name = 'Post-workout high';

UPDATE mood_preset_options SET
  production = 5, craft = 6, groove = 5, sonic_roots = 5, mood = 5, intensity = 4, vibe = 6
WHERE name = 'Deep focus work';

UPDATE mood_preset_options SET
  production = 6, craft = 4, groove = 8, sonic_roots = 7, mood = 8, intensity = 6, vibe = 4
WHERE name = 'Backyard barbecue';

UPDATE mood_preset_options SET
  production = 5, craft = 6, groove = 6, sonic_roots = 5, mood = 4, intensity = 5, vibe = 7
WHERE name = 'Midnight drive alone';

UPDATE mood_preset_options SET
  production = 5, craft = 5, groove = 5, sonic_roots = 5, mood = 6, intensity = 3, vibe = 4
WHERE name = 'First coffee of the day';

UPDATE mood_preset_options SET
  production = 7, craft = 4, groove = 9, sonic_roots = 5, mood = 9, intensity = 7, vibe = 5
WHERE name = 'Dancing in the kitchen';
