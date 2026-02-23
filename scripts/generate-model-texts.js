const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../content/model-texts');
const outputFile = path.join(__dirname, '../src/data/modelTexts.ts');

function parseMarkdown(content) {
  const lines = content.split('\n');

  // Parse frontmatter
  let i = 0;
  if (lines[i] === '---') {
    i++;
    const meta = {};
    while (i < lines.length && lines[i] !== '---') {
      const [key, ...valueParts] = lines[i].split(':');
      if (key && valueParts.length) {
        const value = valueParts.join(':').trim();
        if (value === '|') {
          // Multi-line text
          i++;
          const multilineContent = [];
          while (i < lines.length && lines[i] !== '---' && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
            if (lines[i].trim()) {
              multilineContent.push(lines[i].substring(2));
            }
            i++;
          }
          meta[key.trim()] = multilineContent.join('\n');
          continue;
        }
        meta[key.trim()] = value;
      }
      i++;
    }
    i++; // skip closing ---

    // Parse sentences
    const sentences = [];
    let sentenceId = 1;

    while (i < lines.length) {
      while (i < lines.length && !lines[i].trim()) i++; // skip empty lines

      const german = lines[i]?.trim();
      const chinese = lines[i + 1]?.trim();

      if (german && chinese) {
        sentences.push({
          id: `${meta.id || '1'}-${sentenceId}`,
          german,
          chinese
        });
        sentenceId++;
        i += 2;
      } else {
        break;
      }
    }

    return { meta, sentences };
  }

  return null;
}

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
const modelTexts = [];

files.forEach((file, index) => {
  const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
  const parsed = parseMarkdown(content);

  if (parsed) {
    const modelText = {
      id: String(index + 1),
      title: parsed.meta.title,
      topic: parsed.meta.topic,
      level: parsed.meta.level,
      sentences: parsed.sentences.map((s, i) => ({
        ...s,
        id: `${index + 1}-${i + 1}`
      }))
    };
    if (parsed.meta.examYear) modelText.examYear = parsed.meta.examYear;
    if (parsed.meta.examLocation) modelText.examLocation = parsed.meta.examLocation;
    if (parsed.meta.examPrompt) modelText.examPrompt = parsed.meta.examPrompt;
    modelTexts.push(modelText);
  }
});

const output = `import { ModelText } from '@/src/types/modelText';

export const modelTexts: ModelText[] = ${JSON.stringify(modelTexts, null, 2)};
`;

fs.writeFileSync(outputFile, output);
console.log(`Generated ${modelTexts.length} model texts with ${modelTexts.reduce((sum, t) => sum + t.sentences.length, 0)} sentences`);
