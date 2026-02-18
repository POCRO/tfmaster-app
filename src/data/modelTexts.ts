import { ModelText } from '@/src/types/modelText';

export const modelTexts: ModelText[] = [
  {
    id: '1',
    title: '环境保护的重要性',
    topic: 'Umweltschutz',
    level: 'B2',
    sentences: [
      {
        id: '1-1',
        german: 'Umweltschutz ist eines der wichtigsten Themen unserer Zeit.',
        chinese: '环境保护是我们这个时代最重要的话题之一。'
      },
      {
        id: '1-2',
        german: 'Der Klimawandel bedroht nicht nur die Natur, sondern auch unsere Lebensgrundlage.',
        chinese: '气候变化不仅威胁着自然，也威胁着我们的生存基础。'
      },
      {
        id: '1-3',
        german: 'Deshalb müssen wir alle Verantwortung übernehmen und aktiv werden.',
        chinese: '因此，我们所有人都必须承担责任并积极行动。'
      }
    ]
  }
];
