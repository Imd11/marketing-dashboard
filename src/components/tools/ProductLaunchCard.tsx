import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Copy, X } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { useGenerate } from '@/hooks/useGenerate';
import { useToolStorage } from '@/hooks/useToolStorage';
import { cn } from '@/lib/utils';

const toneOptions = [
  { value: 'excited', label: '兴奋' },
  { value: 'simple', label: '简约' },
  { value: 'story', label: '故事型' },
  { value: 'technical', label: '技术流' },
];

const launchTypeOptions = [
  { value: 'new', label: '新产品发布' },
  { value: 'update', label: '产品更新' },
  { value: 'feature', label: '新功能' },
  { value: 'milestone', label: '里程碑' },
];

const lengthOptions = [
  { value: 'short', label: '短' },
  { value: 'medium', label: '中' },
  { value: 'long', label: '长' },
];

export default function ProductLaunchCard({
  toolId,
  title,
  description,
  systemPrompt,
}: {
  toolId: string;
  title: string;
  description: string;
  systemPrompt: string;
}) {
  const {
    productName,
    productInfo,
    tone,
    launchType,
    length,
    output,
    setField,
    setOutput,
  } = useToolStorage(toolId, ['productName', 'productInfo', 'tone', 'launchType', 'length']);
  const { loading, generate, cancel } = useGenerate();

  const setProductName = (value: string) => setField('productName', value);
  const setProductInfo = (value: string) => setField('productInfo', value);
  const setTone = (value: string) => setField('tone', value);
  const setLaunchType = (value: string) => setField('launchType', value);
  const setLength = (value: string) => setField('length', value);

  const canGenerate = !loading && (productName.trim().length > 0 || productInfo.trim().length > 0);

  async function onGenerate() {
    if (!canGenerate) return;

    const resolvedPrompt = systemPrompt
      .replace(/\{\{productName\}\}/g, productName || '未提供')
      .replace(/\{\{productInfo\}\}/g, productInfo || '未提供')
      .replace(/\{\{tone\}\}/g, toneOptions.find((t) => t.value === tone)?.label || '兴奋')
      .replace(/\{\{launchType\}\}/g, launchTypeOptions.find((l) => l.value === launchType)?.label || '新产品发布')
      .replace(/\{\{length\}\}/g, lengthOptions.find((l) => l.value === length)?.label === '短' ? '100-140' : lengthOptions.find((l) => l.value === length)?.label === '中' ? '150-200' : '250-280');

    let fullOutput = '';
    await generate(
      { systemPrompt: resolvedPrompt, productName: productName, rawThoughts: productInfo },
      (chunk) => {
        fullOutput += chunk;
        setOutput(fullOutput);
      }
    );
    toast.success('已生成', { description: '你可以一键复制到剪贴板' });
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(output);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败', { description: '浏览器可能禁止了剪贴板权限' });
    }
  }

  return (
    <Card className='border-black/20 bg-white shadow-none transition-shadow hover:shadow-sm'>
      <div className='grid grid-cols-1 gap-0 md:grid-cols-2'>
        {/* Left: Input */}
        <div className='p-6 md:border-r md:border-black/20'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='text-[15px] font-semibold tracking-tight'>{title}</div>
              <div className='mt-1 text-sm text-muted-foreground'>{description}</div>
            </div>
          </div>

          <div className='mt-5 space-y-4'>
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                产品名称
              </div>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder='例如：PageLab, Notion AI'
                disabled={loading}
                className='h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25'
              />
            </div>

            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                产品信息
              </div>
              <div className='h-[120px] overflow-y-auto rounded-md border border-gray-200 bg-transparent'>
                <Textarea
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                  placeholder='介绍产品的核心功能、解决的问题、目标用户等...'
                  disabled={loading}
                  className='h-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25 resize-none'
                />
              </div>
            </div>

            {/* Launch Type */}
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                发布类型
              </div>
              <div className='flex flex-wrap gap-2'>
                {launchTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setLaunchType(option.value)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      launchType === option.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                语气风格
              </div>
              <div className='flex flex-wrap gap-2'>
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setTone(option.value)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      tone === option.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                推文长度
              </div>
              <div className='flex gap-1'>
                {lengthOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setLength(option.value)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      length === option.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className='pt-1 flex gap-2'>
              {loading ? (
                <Button onClick={cancel} variant='outline' className='h-10 rounded-md'>
                  <X className='h-4 w-4 mr-2' />
                  取消
                </Button>
              ) : (
                <Button
                  onClick={onGenerate}
                  disabled={!canGenerate}
                  className='h-10 rounded-md'
                >
                  开始生成
                </Button>
              )}
              {loading && (
                <span className='flex items-center text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  生成中…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className='relative p-6'>
          <div className='absolute right-5 top-5 flex gap-2'>
            {output && (
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
            {output ? (
              <div className='prose prose-xs max-w-none prose-headings:tracking-tight prose-p:leading-relaxed'>
                <Streamdown>{output}</Streamdown>
              </div>
            ) : (
              <div className='text-muted-foreground text-sm'>
                生成结果将在此显示（流式输出）
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
