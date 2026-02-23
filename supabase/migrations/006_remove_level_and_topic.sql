-- Remove level and topic fields, keep example fields
DROP INDEX IF EXISTS idx_words_level;
DROP INDEX IF EXISTS idx_words_topic;

ALTER TABLE words DROP COLUMN IF EXISTS level;
ALTER TABLE words DROP COLUMN IF EXISTS topic;
