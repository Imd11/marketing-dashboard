import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ArrowLeftRight, Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TRANSLATION_LANGUAGES,
  TRANSLATION_STYLES,
  STYLE_PROMPTS,
  TRANSLATION_SYSTEM_PROMPT,
} from '@/prompts/twitter/translation';
import { useGenerate } from '@/hooks/useGenerate';

export default function TranslationCard() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('English');
  const [selectedStyle, setSelectedStyle] = useState('general');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generate } = useGenerate();

  const handleSwapLanguages = useCallback(() => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      // Also swap the text
      const tempText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(tempText);
    }
  }, [sourceLang, targetLang, sourceText, translatedText]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      toast.error('请输入要翻译的文本');
      return;
    }

    setLoading(true);
    setTranslatedText('');

    try {
      // Get style requirement
      const styleRequirement = STYLE_PROMPTS[selectedStyle] || STYLE_PROMPTS.general;

      // Build the system prompt
      const systemPrompt = TRANSLATION_SYSTEM_PROMPT
        .replace('{target_language}', targetLang)
        .replace('{style_requirement}', styleRequirement);

      let fullOutput = '';
      await generate(
        { systemPrompt, productName: sourceText, rawThoughts: '' },
        (chunk) => {
          fullOutput += chunk;
          setTranslatedText(fullOutput);
        }
      );

      toast.success('翻译完成');
    } catch (error) {
      console.error('Translation error:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('翻译失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  }, [sourceText, targetLang, selectedStyle, generate]);

  const handleCopy = useCallback(async () => {
    if (!translatedText) return;

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  }, [translatedText]);

  const canTranslate = !loading && sourceText.trim().length > 0;

  return (
    <Card className="border-border/60 bg-white shadow-none">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[15px] font-semibold tracking-tight">🌐 AI 翻译</div>
          <div className="mt-1 text-sm text-muted-foreground">
            智能翻译文本，支持多种语言和风格
          </div>
        </div>

        {/* Language Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {TRANSLATION_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLanguages}
            disabled={sourceLang === 'auto' || loading}
            className="h-9 w-9 p-0 hover:bg-muted"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {TRANSLATION_LANGUAGES.filter(l => l.code !== 'auto').map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source Panel */}
          <div className="space-y-2">
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="输入要翻译的文本..."
              className="min-h-[240px] resize-none bg-muted/30 border-border text-base"
              disabled={loading}
            />
          </div>

          {/* Target Panel */}
          <div className="relative md:border-l md:border-black/20 md:pl-4">
            <Textarea
              value={translatedText}
              readOnly
              placeholder="翻译结果"
              className="min-h-[240px] resize-none bg-muted/30 border-border text-base"
              disabled={loading}
            />
            {translatedText && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-8 gap-1.5 border-black/20 bg-white/70 backdrop-blur"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                复制
              </Button>
            )}
          </div>
        </div>

        {/* Style Cards */}
        <div className="space-y-2">
          <div className="text-[12px] font-medium text-foreground/80">翻译风格</div>
          <div className="flex flex-wrap gap-3">
            {TRANSLATION_STYLES.map((style) => (
              <button
                key={style.code}
                type="button"
                onClick={() => setSelectedStyle(style.code)}
                disabled={loading}
                className={cn(
                  'flex flex-col items-center px-4 py-3 rounded-xl border transition-all',
                  'hover:bg-muted/50',
                  selectedStyle === style.code
                    ? 'bg-muted border-foreground/30'
                    : 'bg-background border-border'
                )}
              >
                <span className="font-medium text-sm text-foreground">{style.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{style.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Translate Button */}
        <Button
          onClick={handleTranslate}
          disabled={!canTranslate}
          className="w-full gap-2 py-6 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              翻译中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              翻译
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
