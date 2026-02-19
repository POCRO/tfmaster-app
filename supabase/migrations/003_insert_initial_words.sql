-- Import initial word data
-- Run this in Supabase SQL Editor to bypass RLS restrictions

INSERT INTO words (word, translation, part_of_speech, ipa, topic, level) VALUES
('Umweltschutz', '环境保护', 'n.', '[ˈʊmvɛltʃʊts]', ARRAY['环境'], 'B2'),
('Forschung', '研究', 'n.', '[ˈfɔʁʃʊŋ]', ARRAY['科学'], 'B2'),
('Bildung', '教育', 'n.', '[ˈbɪldʊŋ]', ARRAY['教育'], 'B2'),
('Gesellschaft', '社会', 'n.', '[ɡəˈzɛlʃaft]', ARRAY['社会'], 'B2'),
('Wirtschaft', '经济', 'n.', '[ˈvɪʁtʃaft]', ARRAY['经济'], 'B2'),
('Entwicklung', '发展', 'n.', '[ɛntˈvɪklʊŋ]', ARRAY['社会'], 'B2'),
('Wissenschaft', '科学', 'n.', '[ˈvɪsn̩ʃaft]', ARRAY['科学'], 'B2'),
('Universität', '大学', 'n.', '[univɛʁziˈtɛːt]', ARRAY['教育'], 'B2'),
('Studium', '学习', 'n.', '[ˈʃtuːdi̯ʊm]', ARRAY['教育'], 'B2'),
('Klima', '气候', 'n.', '[ˈkliːma]', ARRAY['环境'], 'B2'),
('Energie', '能源', 'n.', '[enɛʁˈɡiː]', ARRAY['环境'], 'B2'),
('Technologie', '技术', 'n.', '[tɛçnoloˈɡiː]', ARRAY['科学'], 'C1'),
('Bevölkerung', '人口', 'n.', '[bəˈfœlkəʁʊŋ]', ARRAY['社会'], 'B2'),
('Kultur', '文化', 'n.', '[kʊlˈtuːɐ̯]', ARRAY['文化'], 'B2'),
('Politik', '政治', 'n.', '[poliˈtiːk]', ARRAY['社会'], 'B2'),
('Globalisierung', '全球化', 'n.', '[ɡlobaliˈziːʁʊŋ]', ARRAY['社会'], 'C1'),
('Nachhaltigkeit', '可持续性', 'n.', '[ˈnaːxhaltɪçkaɪ̯t]', ARRAY['环境'], 'C1'),
('Innovation', '创新', 'n.', '[ɪnovaˈt͡si̯oːn]', ARRAY['科学'], 'C1'),
('Kommunikation', '交流', 'n.', '[kɔmʊnikaˈt͡si̯oːn]', ARRAY['社会'], 'B2'),
('Verantwortung', '责任', 'n.', '[fɛɐ̯ˈʔantvɔʁtʊŋ]', ARRAY['社会'], 'B2');
