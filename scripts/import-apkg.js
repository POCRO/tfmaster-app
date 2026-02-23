const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Open the Anki database
const db = new Database(path.join(__dirname, '../temp_apkg/collection.anki2'), { readonly: true });

// Extract all notes
const notes = db.prepare('SELECT flds FROM notes').all();

console.log(`Found ${notes.length} notes`);

// Parse and convert to Word format
const words = [];
let skipped = 0;

notes.forEach((note, index) => {
  try {
    const fields = note.flds.split('\x1f');

    // Field 0: German word
    const germanWord = fields[0]?.trim();
    if (!germanWord) {
      skipped++;
      return;
    }

    // Field 1: Translation (contains HTML, extract text)
    let translation = fields[1]?.replace(/<[^>]*>/g, '').trim() || '';
    // Remove +A, +D, etc. prefixes
    translation = translation.replace(/^\+[A-Z]\s*/, '');

    // Field 4: Detailed info (contains part of speech)
    const detailedInfo = fields[4] || '';

    // Extract part of speech
    let partOfSpeech = '';

    // Check for verb (V.t., V.i., V.refl.)
    if (detailedInfo.includes('V.t.') || detailedInfo.includes('V.i.') || detailedInfo.includes('V.refl.')) {
      partOfSpeech = 'v.';
    }
    // Check for noun with gender
    else if (detailedInfo.match(/\b(der|die|das)\b/i)) {
      const genderMatch = detailedInfo.match(/\b(der|die|das)\b/i);
      if (genderMatch) {
        partOfSpeech = 'n.';
      }
    }
    // Check for adjective
    else if (detailedInfo.includes('Adj.') || detailedInfo.includes('adj.')) {
      partOfSpeech = 'adj.';
    }
    // Check for adverb
    else if (detailedInfo.includes('Adv.') || detailedInfo.includes('adv.')) {
      partOfSpeech = 'adv.';
    }
    // Default
    else {
      partOfSpeech = 'n.';
    }

    // Extract gender for nouns
    let gender = undefined;
    if (partOfSpeech === 'n.') {
      const genderMatch = detailedInfo.match(/\b(der|die|das)\b/i);
      if (genderMatch) {
        gender = genderMatch[1].toLowerCase();
      }
    }

    // Extract example sentence (first example from detailed info)
    let exampleSentence = undefined;
    let exampleTranslation = undefined;

    const exampleMatch = detailedInfo.match(/<br><br>([^<]+)<br><br>([^<]+)<br>/);
    if (exampleMatch) {
      exampleSentence = exampleMatch[1].trim();
      exampleTranslation = exampleMatch[2].trim();
    }

    words.push({
      id: (index + 1).toString(),
      word: germanWord,
      translation: translation.substring(0, 100), // Limit translation length
      partOfSpeech,
      gender,
      exampleSentence,
      exampleTranslation
    });
  } catch (error) {
    console.error(`Error processing note ${index}:`, error.message);
    skipped++;
  }
});

console.log(`Processed ${words.length} words, skipped ${skipped}`);

// Write to TypeScript file
const output = `import { Word } from '../types/word';

export const words: Word[] = ${JSON.stringify(words, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/words-imported.ts'), output);
console.log('Written to src/data/words-imported.ts');

db.close();
