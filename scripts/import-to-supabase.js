require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read and parse words from TypeScript file
const wordsFileContent = fs.readFileSync(path.join(__dirname, '../src/data/words.ts'), 'utf8');
const wordsJsonMatch = wordsFileContent.match(/export const words: Word\[\] = (\[[\s\S]*\]);/);
const words = JSON.parse(wordsJsonMatch[1]);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importWords() {
  console.log(`Starting import of ${words.length} words...`);

  // Clear existing words
  const { error: deleteError } = await supabase.from('words').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error clearing existing words:', deleteError);
  } else {
    console.log('Cleared existing words');
  }

  // Import in batches of 100
  const batchSize = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize).map(word => ({
      word: word.word,
      translation: word.translation,
      part_of_speech: word.partOfSpeech,
      gender: word.gender || null,
      ipa: word.ipa || null,
      example_sentence: word.exampleSentence || null,
      example_translation: word.exampleTranslation || null,
      plural: word.plural || null
    }));

    const { data, error } = await supabase.from('words').insert(batch);

    if (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      console.log(`Imported batch ${i / batchSize + 1}: ${imported}/${words.length}`);
    }
  }

  console.log(`\nImport complete: ${imported} succeeded, ${failed} failed`);
}

importWords().catch(console.error);
