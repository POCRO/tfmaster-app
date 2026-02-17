### 1. 核心功能需求 (Core Functions)

#### 1.1 智能练习引擎 (Interactive Quiz) [P0 - 必须]

**功能描述：**
- **四选一模式：** 系统自动根据当前单词生成 1 个正确释义和 3 个错误干扰项
- **干扰项优化：** 算法优先从同词性（动词对动词）、同话题（环境类对环境类）或同等级（B2/C1）的单词中抽取干扰项，提升辨析难度
- **即时反馈：** 选对即刻进入下一题；选错则高亮正确答案，并弹出该词的**德福例句**和**变位形式**

**技术规格：**
- 干扰项生成算法：优先级排序（同词性 > 同话题 > 同等级 > 随机）
- 答案位置随机化：使用 Fisher-Yates 洗牌算法
- 反馈延迟：错误答案高亮 1.5 秒后自动进入下一题
- 键盘快捷键：数字键 1-4 对应选项 A-D，Enter 确认

**验收标准：**
- [ ] 每次测验生成的 4 个选项中，正确答案位置随机分布
- [ ] 干扰项至少 70% 来自同词性或同话题词汇
- [ ] 选错后弹窗显示例句，且例句包含该单词的实际用法
- [ ] 支持键盘操作完成整个测验流程

#### 1.2 自动语音系统 (Audio System) [P1 - 重要]

**功能描述：**
- **多维触发：** 进入新单词时自动朗读（德语正音）；用户可点击图标重听
- **语速调节：** 支持正常语速与慢速（0.8x），帮助听清德福高频长复合词

**技术规格：**
- v1.0: 使用 Web Speech API (`speechSynthesis`)，语言设置为 `de-DE`
- v3.0: 接入 Azure Cognitive Services TTS，使用 `de-DE-KatjaNeural` 音色
- 音频缓存：首次播放后缓存到 IndexedDB，减少重复请求
- 播放控制：空格键播放/暂停，支持播放进度显示

**验收标准：**
- [ ] 每个单词切换时自动播放发音，延迟 < 500ms
- [ ] 点击发音图标或按空格键可重复播放
- [ ] 语速调节功能正常，0.8x 速度下发音清晰可辨
- [ ] 离线模式下使用 Web Speech API 降级方案

---

### 2. 艾宾浩斯记忆算法 (SRS Engine) [P0 - 必须]

#### 2.1 每日任务生成

**功能描述：**
- **复习流：** 自动筛选 `nextReviewDate <= 今天` 的旧词
- **新词流：** 根据用户设定（默认每日 20 个）提取从未学习过的新词
- **任务优先级：** 复习词优先于新词，确保记忆巩固

**技术规格：**
```sql
-- 复习词查询
SELECT * FROM user_words
WHERE user_id = ? AND next_review_date <= CURRENT_DATE
ORDER BY next_review_date ASC

-- 新词查询
SELECT * FROM words
WHERE id NOT IN (SELECT word_id FROM user_words WHERE user_id = ?)
LIMIT ?
```

**验收标准：**
- [ ] 每日登录时自动生成当日任务列表
- [ ] 复习词按到期时间排序，越早到期越优先
- [ ] 新词数量可在设置中调整（10/20/30/50）
- [ ] 完成所有复习词后才开始新词学习

#### 2.2 动态间隔计算 (SM-2 Algorithm)

**功能描述：**
- **记忆状态：** 为每个单词记录 `easeFactor`（简易度）、`interval`（复习间隔天数）、`repetitions`（连续正确次数）、`nextReviewDate`（下次复习日期）
- **奖惩机制：**
  - 选错：interval = 0, repetitions = 0（重新学习）
  - 选对：interval 按 SM-2 公式递增（1 → 6 → 15 → 35...）

**技术规格：**
```javascript
// SM-2 算法实现
function calculateNextReview(quality, easeFactor, interval, repetitions) {
  // quality: 0=错误, 1=正确
  if (quality === 0) {
    return { interval: 0, repetitions: 0, easeFactor };
  }

  let newRepetitions = repetitions + 1;
  let newInterval;

  if (newRepetitions === 1) newInterval = 1;
  else if (newRepetitions === 2) newInterval = 6;
  else newInterval = Math.round(interval * easeFactor);

  let newEaseFactor = easeFactor + (0.1 - (1 - quality) * 0.08);
  newEaseFactor = Math.max(1.3, newEaseFactor);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReviewDate: addDays(today, newInterval)
  };
}
```

**验收标准：**
- [ ] 首次学习的单词，选对后 1 天后复习
- [ ] 第二次选对后 6 天后复习
- [ ] 第三次及以后按 easeFactor 指数增长
- [ ] 选错的单词立即重新加入当日任务队列

---

### 3. 数据与内容需求 (Content & Data) [P0 - 必须]

#### 3.1 德福专项词库

**数据结构：**
```typescript
interface Word {
  id: string;
  word: string;              // 德语单词
  ipa: string;               // IPA 音标
  partOfSpeech: string;      // 词性 (n./v./adj./adv.)
  gender?: string;           // 名词性别 (der/die/das)
  translation: string;       // 中文释义
  exampleSentence: string;   // 德福例句
  exampleTranslation: string;// 例句中文翻译
  topic: string[];           // 话题标签
  level: string;             // 等级 (B2/C1)
  synonyms: string[];        // 近义词 ID 列表
  conjugation?: object;      // 动词变位
  plural?: string;           // 名词复数
}
```

**内容要求：**
- v1.0: 50-100 个高频词（手动整理）
- v2.0: 500-1000 个德福核心词汇
- v3.0: 2000+ 个完整德福词库

**话题分类：**
- 大学生活 (Universitätsleben)
- 科学研究 (Wissenschaft)
- 环境保护 (Umweltschutz)
- 人口社会 (Gesellschaft)
- 经济发展 (Wirtschaft)
- 文化教育 (Bildung)

**验收标准：**
- [ ] 每个单词包含完整的字段信息
- [ ] 例句来自真实德福考试或模拟题
- [ ] 同义词关联准确，便于生成干扰项
- [ ] 话题标签覆盖德福考试所有主题

#### 3.2 用户进度数据

**数据结构：**
```typescript
interface UserWord {
  userId: string;
  wordId: string;
  easeFactor: number;        // 简易度因子 (初始 2.5)
  interval: number;          // 复习间隔天数
  repetitions: number;       // 连续正确次数
  nextReviewDate: Date;      // 下次复习日期
  lastReviewDate: Date;      // 上次复习日期
  totalReviews: number;      // 总复习次数
  correctCount: number;      // 正确次数
  wrongCount: number;        // 错误次数
  createdAt: Date;           // 首次学习时间
  updatedAt: Date;           // 最后更新时间
}
```

**存储方案：**
- 主存储：Supabase PostgreSQL
- 本地缓存：localStorage (离线支持)
- 同步策略：在线时实时同步，离线时本地存储，恢复网络后批量上传

**验收标准：**
- [ ] 用户数据实时保存到云端
- [ ] 离线模式下数据保存到本地
- [ ] 跨设备登录时数据自动同步
- [ ] 数据冲突时以最新时间戳为准

---

### 4. UI/UX 交互需求 (Design & Experience) [P1 - 重要]

#### 4.1 极简主义设计

**设计原则：**
- 大留白设计，单屏只显示核心信息
- 字体：Inter/Helvetica，字号 16-24px
- 配色：黑白灰主色调 + 单一强调色（绿色表示正确，红色表示错误）
- 无干扰元素：隐藏导航栏，沉浸式学习体验

**页面布局：**
```
┌─────────────────────────────────┐
│  进度条 [████████░░] 15/20      │
├─────────────────────────────────┤
│                                 │
│         Umweltschutz            │ ← 单词（大字号）
│         [🔊]                     │ ← 发音按钮
│                                 │
│  A. 环境保护                     │ ← 选项（卡片式）
│  B. 经济发展                     │
│  C. 社会问题                     │
│  D. 文化交流                     │
│                                 │
└─────────────────────────────────┘
```

**验收标准：**
- [ ] 响应式设计，适配手机/平板/桌面
- [ ] 单词字号在移动端 ≥ 24px，桌面端 ≥ 32px
- [ ] 选项卡片有明显的 hover 和 active 状态
- [ ] 整体风格与参考图保持一致

#### 4.2 沉浸式交互

**快捷键系统：**
- `1-4` / `A-D`: 选择对应选项
- `Space`: 播放/暂停发音
- `Enter`: 确认选择（选中状态下）
- `N`: 跳到下一题（仅在答题后）
- `S`: 慢速播放
- `Esc`: 退出测验

**动画反馈：**
- 选项点击：200ms 缩放动画
- 正确答案：绿色高亮 + 淡入动画
- 错误答案：红色抖动 + 正确答案高亮
- 切换题目：300ms 淡入淡出过渡

**验收标准：**
- [ ] 所有快捷键功能正常
- [ ] 键盘操作可完成全流程，无需鼠标
- [ ] 动画流畅，无卡顿（60fps）
- [ ] 移动端支持滑动切换题目

#### 4.3 可视化反馈

**进度显示：**
- 顶部进度条：显示今日任务完成度
- 数字指示：`已完成/总数` (如 15/20)
- 分类统计：复习词 vs 新词分别显示

**成就系统：**
- 累计学习词汇量
- 连续打卡天数（streak）
- 今日学习时长
- 记忆曲线图表（echarts/recharts）
- 掌握度分布（熟练/学习中/待复习）

**验收标准：**
- [ ] 进度条实时更新
- [ ] 完成当日任务后显示庆祝动画
- [ ] 统计页面数据准确，图表清晰
- [ ] 支持查看历史学习记录

---

### 5. 技术路径要求 (Technical Stack)

#### 5.1 前端技术栈

**框架选择：** Next.js 14+ (App Router)
- 理由：SSR/SSG 支持，SEO 友好，性能优化
- 状态管理：Zustand (轻量级，适合中小型应用)
- UI 组件：Tailwind CSS + Radix UI
- 动画：Framer Motion
- 图表：Recharts

**响应式设计：**
- 移动端优先 (Mobile First)
- 断点：sm(640px) / md(768px) / lg(1024px) / xl(1280px)
- PWA 支持：离线缓存，添加到主屏幕

#### 5.2 后端技术栈

**BaaS 平台：** Supabase
- 认证：Email/Password + Google OAuth
- 数据库：PostgreSQL (Row Level Security)
- 实时订阅：监听用户数据变化
- 存储：音频文件 CDN 加速

**API 设计：**
- RESTful API (Supabase 自动生成)
- 实时 API (WebSocket)
- Edge Functions (Deno) 用于复杂业务逻辑

#### 5.3 部署方案

**托管平台：** Vercel
- 自动化部署：Git push 触发
- 边缘网络：全球 CDN 加速
- 环境变量：开发/生产环境隔离
- 监控：Vercel Analytics + Sentry

**域名与 SSL：**
- 自定义域名
- 自动 HTTPS 证书

#### 5.4 安全与性能

**安全措施：**
- 用户数据加密存储 (AES-256)
- JWT Token 认证
- CORS 策略配置
- SQL 注入防护 (Supabase RLS)
- XSS 防护 (Content Security Policy)

**性能优化：**
- 图片懒加载 + WebP 格式
- 代码分割 (Dynamic Import)
- 音频预加载 (前 3 个单词)
- IndexedDB 缓存策略
- Service Worker 离线支持

**验收标准：**
- [ ] Lighthouse 性能评分 ≥ 90
- [ ] 首屏加载时间 < 2s
- [ ] 支持离线模式基本功能
- [ ] 通过 OWASP Top 10 安全检查

---

### 6. 非功能性需求 (Non-Functional Requirements)

#### 6.1 性能要求
- 页面加载时间：< 2s (3G 网络)
- 交互响应时间：< 100ms
- 音频播放延迟：< 500ms
- 支持并发用户：1000+

#### 6.2 兼容性要求
- 浏览器：Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- 移动端：iOS 14+, Android 10+
- 屏幕尺寸：320px - 2560px

#### 6.3 可用性要求
- 系统可用性：99.5%
- 数据备份：每日自动备份
- 灾难恢复：RTO < 4h, RPO < 1h

---
