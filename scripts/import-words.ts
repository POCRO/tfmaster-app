import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { words } from '../src/data/words';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importWords() {
  console.log(`Importing ${words.length} words...`);

  const wordsData = words.map(word => ({
    word: word.word,
    translation: word.translation,
    part_of_speech: word.partOfSpeech,
    ipa: word.ipa || null,
    topic: word.topic,
    level: word.level,
  }));

  const { data, error } = await supabase
    .from('words')
    .insert(wordsData)
    .select();

  if (error) {
    console.error('Error importing words:', error);
    process.exit(1);
  }

  console.log(`Successfully imported ${data?.length} words`);
}

importWords();
