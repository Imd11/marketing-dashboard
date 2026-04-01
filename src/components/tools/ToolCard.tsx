// DESIGN MEMORY (Notion Aesthetic)
// - 工具卡：细边框 + 极轻 hover shadow
// - 内部 50/50 分栏，Input 左、Output 右
// - 输入框透明底 + 浅边框，Focus 只略微加深

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Copy, X } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { useGenerate } from '@/hooks/useGenerate';

export type ToolCardInput = {
  productName: string;
  rawThoughts: string;
};

export type SystemPrompt = string;

export default function ToolCard({
  toolId,
  title,
  description,
  systemPrompt,
}: {
  toolId: string;
  title: string;
  description: string;
  systemPrompt: SystemPrompt;
}) {
  const [productName, setProductName] = useState('');
  const [rawThoughts, setRawThoughts] = useState('');
  const { output, loading, generate, cancel } = useGenerate();

  const canGenerate = !loading && (productName.trim().length > 0 || rawThoughts.trim().length > 0);

  async function onGenerate() {
    if (!canGenerate) return;
    await generate({ systemPrompt, productName, rawThoughts });
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
    <Card
      className={
        'border-black/20 bg-white shadow-none transition-shadow hover:shadow-sm'
      }
    >
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
                Product Name
              </div>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder='例如：Marketing Growth Dashboard'
                disabled={loading}
                className={
                  'h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25'
                }
              />
            </div>

            <div className='space-y-2'>
              <div className='text-[12px] font-medium text-foreground/80'>
                Raw Thoughts
              </div>
              <Textarea
                value={rawThoughts}
                onChange={(e) => setRawThoughts(e.target.value)}
                placeholder='把原始想法丢进来：卖点、受众、场景、语气、你想强调的点…'
                disabled={loading}
                className={
                  'min-h-[120px] resize-y bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25'
                }
              />
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
                  ✨ 开始生成 (Generate)
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
              <div className='prose prose-sm max-w-none prose-headings:tracking-tight prose-p:leading-relaxed'>
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
