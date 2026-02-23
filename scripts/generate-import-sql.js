const fs = require('fs');
const path = require('path');

// Read and parse words from TypeScript file
const wordsFileContent = fs.readFileSync(path.join(__dirname, '../src/data/words.ts'), 'utf8');
const wordsJsonMatch = wordsFileContent.match(/export const words: Word\[\] = (\[[\s\S]*\]);/);
const words = JSON.parse(wordsJsonMatch[1]);

console.log(`Generating SQL for ${words.length} words...`);

// Helper to escape SQL strings
function escapeSql(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Generate SQL
let sql = `-- Import ${words.length} words from 德语专四.apkg
-- Generated on ${new Date().toISOString()}

-- First, apply migration to remove level and topic columns if not already done
-- ALTER TABLE words DROP COLUMN IF EXISTS level;
-- ALTER TABLE words DROP COLUMN IF EXISTS topic;

-- Clear existing words
DELETE FROM words;

-- Insert words in batches
`;

const batchSize = 50;
for (let i = 0; i < words.length; i += batchSize) {
  const batch = words.slice(i, i + batchSize);

  sql += `\n-- Batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, words.length)})\n`;
  sql += 'INSERT INTO words (word, translation, part_of_speech, gender, ipa, example_sentence, example_translation, plural) VALUES\n';

  const values = batch.map(word => {
    return `  (${escapeSql(word.word)}, ${escapeSql(word.translation)}, ${escapeSql(word.partOfSpeech)}, ${escapeSql(word.gender)}, ${escapeSql(word.ipa)}, ${escapeSql(word.exampleSentence)}, ${escapeSql(word.exampleTranslation)}, ${escapeSql(word.plural)})`;
  });

  sql += values.join(',\n') + ';\n';
}

sql += `\n-- Import complete: ${words.length} words\n`;

// Write to file
const outputPath = path.join(__dirname, '../supabase/import-words.sql');
fs.writeFileSync(outputPath, sql);

console.log(`SQL script generated: ${outputPath}`);
console.log(`File size: ${(sql.length / 1024).toFixed(2)} KB`);
