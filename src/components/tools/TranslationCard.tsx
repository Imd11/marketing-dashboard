import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Copy, X, ArrowLeftRight } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { useGenerate } from '@/hooks/useGenerate';
import { useToolStorage } from '@/hooks/useToolStorage';
import { cn } from '@/lib/utils';
import {
  TRANSLATION_LANGUAGES,
  TRANSLATION_STYLES,
  STYLE_PROMPTS,
  TRANSLATION_SYSTEM_PROMPT,
} from '@/prompts/twitter/translation';

export default function TranslationCard() {
  const {
    sourceText,
    targetLang,
    sourceLang,
    selectedStyle,
    output,
    setField,
    setOutput,
  } = useToolStorage('twitter-translate', ['sourceText', 'targetLang', 'sourceLang', 'selectedStyle']);

  const setSourceText = (value: string) => setField('sourceText', value);
  const setTargetLang = (value: string) => setField('targetLang', value);
  const setSourceLang = (value: string) => setField('sourceLang', value);
  const setSelectedStyle = (value: string) => setField('selectedStyle', value);

  const { loading, generate, cancel } = useGenerate();

  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      // Also swap the text
      const tempText = sourceText;
      setSourceText(translatedText);
      setOutput(tempText);
    }
  };

  const canTranslate = !loading && sourceText.trim().length > 0;
  const translatedText = output;

  async function onTranslate() {
    if (!canTranslate) return;

    const styleRequirement = STYLE_PROMPTS[selectedStyle] || STYLE_PROMPTS.general;

    const resolvedPrompt = TRANSLATION_SYSTEM_PROMPT
      .replace('{target_language}', targetLang)
      .replace('{style_requirement}', styleRequirement);

    let fullOutput = '';
    await generate(
      { systemPrompt: resolvedPrompt, productName: sourceText, rawThoughts: '' },
      (chunk) => {
        fullOutput += chunk;
        setOutput(fullOutput);
      }
    );
    toast.success('翻译完成');
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(translatedText);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  }

  return (
    <Card className='border-black/20 bg-white shadow-none transition-shadow hover:shadow-sm'>
      <div className='grid grid-cols-1 gap-0 md:grid-cols-2'>
        {/* Left: Input */}
        <div className='p-6 md:border-r md:border-black/20'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='text-[15px] font-semibold tracking-tight'>🌐 AI 翻译</div>
              <div className='mt-1 text-sm text-muted-foreground'>
                智能翻译文本，支持多种语言和风格
              </div>
            </div>
          </div>

          <div className='mt-5 space-y-4'>
            {/* Language Selection */}
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                源语言
              </div>
              <div className='flex items-center gap-2'>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className='flex-1 h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
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
                  className="h-10 w-10 p-0 hover:bg-muted"
                  title="交换语言"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className='flex-1 h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={loading}
                >
                  {TRANSLATION_LANGUAGES.filter(l => l.code !== 'auto').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Source Text */}
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                源文本
              </div>
              <div className='h-[180px] overflow-y-auto rounded-md border border-gray-200 bg-transparent'>
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder='输入要翻译的文本...'
                  disabled={loading}
                  className='h-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25 resize-none'
                />
              </div>
            </div>

            {/* Translation Style */}
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                翻译风格
              </div>
              <div className='flex flex-wrap gap-2'>
                {TRANSLATION_STYLES.map((style) => (
                  <button
                    key={style.code}
                    type='button'
                    onClick={() => setSelectedStyle(style.code)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full border transition-colors',
                      selectedStyle === style.code
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
              <div className='text-xs text-muted-foreground'>
                {TRANSLATION_STYLES.find(s => s.code === selectedStyle)?.description}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='pt-1 flex gap-2'>
              {loading ? (
                <Button onClick={cancel} variant='outline' className='h-10 rounded-md'>
                  <X className='h-4 w-4 mr-2' />
                  取消
                </Button>
              ) : (
                <Button
                  onClick={onTranslate}
                  disabled={!canTranslate}
                  className='h-10 rounded-md'
                >
                  翻译
                </Button>
              )}
              {loading && (
                <span className='flex items-center text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  翻译中…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className='relative p-6'>
          <div className='absolute right-5 top-5 flex gap-2'>
            {translatedText && (
              <Button
                variant='outline'
                size='sm'
                onClick={onCopy}
                className='h-8 gap-1.5 border-black/20 bg-white/70 backdrop-blur'
              >
                <Copy className='h-4 w-4' />
                复制
              </Button>
            )}
          </div>

          <div className='rounded-md border border-black/20 bg-muted/30 p-4 h-[500px] overflow-y-auto'>
            {translatedText ? (
              <div className='prose prose-xs max-w-none prose-headings:tracking-tight prose-p:leading-relaxed'>
                <Streamdown>{translatedText}</Streamdown>
              </div>
            ) : (
              <div className='text-muted-foreground text-sm h-full flex items-center justify-center'>
                翻译结果将在此显示（流式输出）
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
