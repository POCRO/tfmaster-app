import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ApkgNote {
  id: number;
  flds: string;
}

function parseApkgNote(flds: string) {
  const fields = flds.split('^_');
  const word = fields[0] || '';
  const translation = fields[1] || '';
  const detailedDef = fields[4] || '';

  // Extract part of speech
  let partOfSpeech = '';
  if (detailedDef.includes('V.t.')) partOfSpeech = 'v.t.';
  else if (detailedDef.includes('V.i.')) partOfSpeech = 'v.i.';
  else if (detailedDef.includes('der,')) partOfSpeech = 'n.m.';
  else if (detailedDef.includes('die,')) partOfSpeech = 'n.f.';
  else if (detailedDef.includes('das,')) partOfSpeech = 'n.n.';

  // Extract gender
  let gender = null;
  if (partOfSpeech.startsWith('n.')) {
    if (partOfSpeech === 'n.m.') gender = 'der';
    else if (partOfSpeech === 'n.f.') gender = 'die';
    else if (partOfSpeech === 'n.n.') gender = 'das';
  }

  // Clean translation
  const cleanTranslation = translation.replace(/<br>/g, '').replace(/\+[AD]/g, '').trim();

  // Extract example sentence (first example from detailed definition)
  let exampleSentence = null;
  let exampleTranslation = null;
  const exampleMatch = detailedDef.match(/([A-ZÄÖÜ][^<>]*?)<br><br>([^<>]+)/);
  if (exampleMatch) {
    exampleSentence = exampleMatch[1].trim();
    exampleTranslation = exampleMatch[2].trim();
  }

  return {
    word: word.trim(),
    translation: cleanTranslation,
    part_of_speech: partOfSpeech || 'unknown',
    gender,
    example_sentence: exampleSentence,
    example_translation: exampleTranslation,
  };
}

async function importWords() {
  const db = new Database('/tmp/apkg_analysis/collection.anki2', { readonly: true });

  const notes = db.prepare('SELECT id, flds FROM notes').all() as ApkgNote[];

  console.log(`Found ${notes.length} notes`);

  const words = notes.map(note => parseApkgNote(note.flds)).filter(w => w.word);

  console.log(`Parsed ${words.length} words`);

  const { data, error } = await supabase.from('words').insert(words);

  if (error) {
    console.error('Error inserting words:', error);
  } else {
    console.log(`Successfully imported ${words.length} words`);
  }

  db.close();
}

importWords();
