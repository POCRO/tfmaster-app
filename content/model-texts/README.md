# 范文跟读内容管理系统

## 目录结构

```
content/model-texts/     # 存放 Markdown 格式的范文
scripts/generate-model-texts.js  # 生成脚本
src/data/modelTexts.ts   # 生成的数据文件
```

## Markdown 文件格式

### 基础格式
```markdown
---
title: 范文标题（中文）
topic: 话题（德语）
level: B2
---

德语句子1
中文翻译1

德语句子2
中文翻译2
```

### 真题格式（包含考题原文）
```markdown
---
title: 范文标题（中文）
topic: 话题（德语）
level: B2
examYear: 2014.02
examLocation: 德国
examPrompt: |
  **Thema:** 题目
  **Einleitungstext:** 引导文本
  **Grafik 1:** 图表1数据
  **Grafik 2:** 图表2数据
---

德语句子1
中文翻译1

德语句子2
中文翻译2
```

**规则**：
- 文件名格式：`01-topic.md`, `02-topic.md`
- 前置元数据用 `---` 包裹
- 真题可选字段：`examYear`（年份）、`examLocation`（考点）、`examPrompt`（题目原文）
- `examPrompt` 使用 `|` 表示多行文本
- 句子成对出现：德语在前，中文在后
- 句子对之间用空行分隔

## 使用方法

1. **添加新范文**：在 `content/model-texts/` 创建新的 `.md` 文件
2. **生成数据**：运行 `node scripts/generate-model-texts.js`
3. **验证**：检查 `src/data/modelTexts.ts` 是否正确生成

## 示例

参考 `content/model-texts/01-umweltschutz.md`
