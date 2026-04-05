// Translation style definitions - migrated from neloo project
export const TRANSLATION_STYLES = [
  { code: "general", label: "通用", description: "自然通顺的表达" },
  { code: "business_email", label: "商务邮件", description: "专业礼貌用语" },
  { code: "academic", label: "学术论文", description: "严谨规范的表达" },
  { code: "technical", label: "技术文档", description: "准确简洁的语言" },
  { code: "social_media", label: "社交媒体", description: "轻松亲切的口语" },
];

// Style-specific translation instructions
export const STYLE_PROMPTS: Record<string, string> = {
  general: "使用自然、通顺的表达方式",
  business_email: "使用专业、礼貌的商务用语，注意邮件格式",
  academic: "使用严谨、学术规范的表达，保留专业术语",
  technical: "使用准确、简洁的技术语言，保持术语一致性",
  social_media: "使用轻松、亲切的口语化表达",
};

// Supported languages - migrated from neloo TranslatePanel.tsx
export const TRANSLATION_LANGUAGES = [
  { code: "auto", label: "自动检测" },
  { code: "English", label: "English" },
  { code: "Chinese (Simplified)", label: "简体中文" },
  { code: "Chinese (Traditional)", label: "繁體中文" },
  { code: "Japanese", label: "日本語" },
  { code: "Korean", label: "한국어" },
  { code: "French", label: "Français" },
  { code: "German", label: "Deutsch" },
  { code: "Spanish", label: "Español" },
  { code: "Portuguese", label: "Português" },
  { code: "Russian", label: "Русский" },
  { code: "Arabic", label: "العربية" },
  { code: "Italian", label: "Italiano" },
  { code: "Dutch", label: "Nederlands" },
  { code: "Thai", label: "ไทย" },
  { code: "Vietnamese", label: "Tiếng Việt" },
];

// Translation system prompt - migrated from neloo translate_routes.py
export const TRANSLATION_SYSTEM_PROMPT = `You are a professional translation assistant. Detect the source language automatically. Translate the user's text into {target_language}.

Translation style requirement: {style_requirement}

Preserve tone, meaning, punctuation, emoji, and inline formatting. Return only the translated text without commentary, labels, or quotes.`;

// Twitter-specific translation prompt
export const TWITTER_TRANSLATION_SYSTEM = `你是一位专业的 Twitter (X) 内容翻译助手。你的任务是将用户输入的文本翻译成适合在 Twitter 上发布的内容。

**目标语言：** {target_language}
**翻译风格：** {style_requirement}

**翻译准则：**
1. 保持原文的核心意思和情感
2. 适应 Twitter 的简洁风格（如需）
3. 保留表情符号和格式
4. 使用地道的表达方式
5. 如果是社交媒体风格，可以使用更口语化的表达

只返回翻译结果，不要添加任何解释或评论。`;

export const translationMeta = {
  name: 'AI 翻译',
  description: '智能翻译文本，支持多种语言和风格',
};
