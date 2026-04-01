# API Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 接入 DeepSeek 流式 API，实现从 Mock 模板到真实 LLM 生成的切换。

**Architecture:** API 调用封装在 `lib/api/deepseek.ts`，Prompt 配置在 `prompts/` 目录，前端通过 `useGenerate` Hook 调用。流式响应实时更新输出区。

**Tech Stack:** Vite + React + TypeScript, DeepSeek API (OpenAI 兼容格式)

---

## Task 1: 创建 API 配置文件

**Files:**
- Create: `src/lib/api/config.ts`

**Step 1: Write src/lib/api/config.ts**

```typescript
export const API_CONFIG = {
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  apiKey: 'sk-0472bbc337b747eab9cf7e1bd703a012',
};
```

**Step 2: Commit**

```bash
cd /Users/yang/Desktop/Josh/marketing-growth-dashboard
git add src/lib/api/config.ts
git commit -m "feat: add DeepSeek API config"
```

---

## Task 2: 创建 DeepSeek API 调用封装（流式）

**Files:**
- Create: `src/lib/api/deepseek.ts`

**Step 1: Write src/lib/api/deepseek.ts**

```typescript
import { API_CONFIG } from './config';

export interface GenerateParams {
  systemPrompt: string;
  productName: string;
  rawThoughts: string;
}

function buildUserPrompt(params: GenerateParams): string {
  return `产品名称: ${params.productName}
原始想法: ${params.rawThoughts}`;
}

export async function streamGenerate(
  params: GenerateParams,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: buildUserPrompt(params) },
      ],
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const reader = response.body?.getReadableStream().getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('无法读取响应流');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              onChunk(delta);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/api/deepseek.ts
git commit -m "feat: add DeepSeek streaming API wrapper"
```

---

## Task 3: 创建 Prompts 目录结构

**Files:**
- Create: `src/prompts/index.ts`
- Create: `src/prompts/reddit/index.ts`
- Create: `src/prompts/reddit/post-refiner.ts`
- Create: `src/prompts/reddit/smart-replier.ts`

**Step 1: Write src/prompts/reddit/post-refiner.ts**

```typescript
export const POST_REFINDER_SYSTEM = `你是一个专业的 Reddit 帖子写作助手。
请根据用户输入的产品名称和原始想法，生成一个可直接发布的 Reddit 帖子。

要求：
- 标题吸引人，符合 Reddit 社区风格
- 正文结构清晰，包含 TL;DR
- 语言自然，像真人写作
- 不要过度推销`;

export const postRefinerMeta = {
  id: 'reddit-post-refiner',
  name: '帖子神策手',
  description: '把你的原始想法重写成可直接发布的 Reddit 帖子结构。',
};
```

**Step 2: Write src/prompts/reddit/smart-replier.ts**

```typescript
export const SMART_REPLIER_SYSTEM = `你是一个友好的 Reddit 社区成员。
请根据用户输入的产品名称和原始评论/问题，生成 3 组自然的回复候选。

要求：
- 像真人一样自然、友好、不推销
- 先共情再给价值
- 每组回复不超过 3 句话
- 适合评论区互动`;

export const smartReplierMeta = {
  id: 'reddit-smart-replier',
  name: '神回复生成器',
  description: '生成 3 组"像真人"的回复候选，适合评论区互动。',
};
```

**Step 3: Write src/prompts/reddit/index.ts**

```typescript
export { POST_REFINDER_SYSTEM, postRefinerMeta } from './post-refiner';
export { SMART_REPLIER_SYSTEM, smartReplierMeta } from './smart-replier';
```

**Step 4: Write src/prompts/index.ts**

```typescript
export * from './reddit';
```

**Step 5: Commit**

```bash
git add src/prompts/
git commit -m "feat: create prompts directory structure"
```

---

## Task 4: 创建 useGenerate Hook

**Files:**
- Create: `src/hooks/useGenerate.ts`

**Step 1: Write src/hooks/useGenerate.ts**

```typescript
import { useState, useCallback, useRef } from 'react';
import { streamGenerate, type GenerateParams } from '@/lib/api/deepseek';
import { toast } from 'sonner';

export function useGenerate() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setOutput('');

    try {
      await streamGenerate(
        params,
        (chunk) => {
          setOutput((prev) => prev + chunk);
        },
        controller.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 用户取消，忽略
        return;
      }
      toast.error('生成失败', {
        description: error instanceof Error ? error.message : '未知错误',
      });
      setOutput('');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  return { output, loading, generate, cancel };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useGenerate.ts
git commit -m "feat: add useGenerate hook for streaming generation"
```

---

## Task 5: 修改 ToolCard 接入真实 API

**Files:**
- Modify: `src/components/tools/ToolCard.tsx`

**Step 1: Read current ToolCard.tsx**

确认现有代码结构，然后修改。

**Step 2: Write updated ToolCard.tsx**

```typescript
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

          <div className='rounded-md border border-black/20 bg-muted/30 p-4 min-h-[200px]'>
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
```

**Step 3: Commit**

```bash
git add src/components/tools/ToolCard.tsx
git commit -m "feat: connect ToolCard to real DeepSeek API"
```

---

## Task 6: 修改 Reddit 页面接入 System Prompt

**Files:**
- Modify: `src/pages/Reddit.tsx`

**Step 1: Read current Reddit.tsx**

确认现有代码结构。

**Step 2: Write updated Reddit.tsx**

```typescript
import { useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import ToolCard from '@/components/tools/ToolCard';
import { cn } from '@/lib/utils';
import {
  POST_REFINDER_SYSTEM,
  SMART_REPLIER_SYSTEM,
} from '@/prompts/reddit';

type ToolDef = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  systemPrompt: string;
};

export default function Reddit() {
  const tools: ToolDef[] = useMemo(
    () => [
      {
        id: 'reddit-post-refiner',
        title: '✨ 帖子神策手 (Post Refiner)',
        shortName: '✨ 帖子神策手',
        description: '把你的原始想法重写成可直接发布的 Reddit 帖子结构。',
        systemPrompt: POST_REFINDER_SYSTEM,
      },
      {
        id: 'reddit-smart-replier',
        title: '💬 神回复生成器 (Smart Replier)',
        shortName: '💬 神回复生成器',
        description: '生成 3 组"像真人"的回复候选，适合评论区互动。',
        systemPrompt: SMART_REPLIER_SYSTEM,
      },
    ],
    []
  );

  const [activeToolId, setActiveToolId] = useState<string>(tools[0]?.id);
  const activeTool = tools.find((t) => t.id === activeToolId) ?? tools[0];

  return (
    <AppShell title='营销阵地' subtitle='Reddit'>
      {/* Master-Detail Layout */}
      <div className='grid grid-cols-1 gap-0 md:grid-cols-[285px_1fr]'>
        {/* Left: Tool Menu List (20%~25%) */}
        <div className='pr-0 md:pr-0 min-h-[714px] self-stretch'>
          <div className='px-2 pb-2 text-[12px] font-medium text-muted-foreground'>
            Tools
          </div>

          <div className='space-y-1 px-1'>
            {tools.map((tool) => {
              const active = tool.id === activeToolId;
              return (
                <button
                  key={tool.id}
                  type='button'
                  onClick={() => setActiveToolId(tool.id)}
                  className={cn(
                    'w-full rounded-md px-2 py-2 text-left',
                    'text-[14px] text-foreground/85',
                    'transition-colors',
                    'hover:bg-gray-50 hover:text-foreground',
                    active && 'bg-gray-100 font-semibold text-foreground'
                  )}
                >
                  <span className='truncate'>{tool.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Tool Workspace (75%~80%) */}
        <div className='mt-4 md:mt-0 md:border-l md:border-black/20 md:pl-6 self-stretch'>
          {activeTool ? (
            <ToolCard
              toolId={activeTool.id}
              title={activeTool.title}
              description={activeTool.description}
              systemPrompt={activeTool.systemPrompt}
            />
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
```

**Step 3: Commit**

```bash
git add src/pages/Reddit.tsx
git commit -m "feat: connect Reddit page to real System Prompts"
```

---

## Task 7: 验证构建

**Step 1: Run build**

Run: `cd /Users/yang/Desktop/Josh/marketing-growth-dashboard && pnpm build`
Expected: 构建成功，无错误

**Step 2: Run dev server**

Run: `cd /Users/yang/Desktop/Josh/marketing-growth-dashboard && pnpm dev`
Expected: 开发服务器启动成功

---

## Summary

完成以上 7 个 Task 后，你将拥有：

1. ✅ DeepSeek API 配置 (`src/lib/api/config.ts`)
2. ✅ 流式 API 调用封装 (`src/lib/api/deepseek.ts`)
3. ✅ Prompts 目录结构 (`src/prompts/`)
4. ✅ useGenerate Hook (`src/hooks/useGenerate.ts`)
5. ✅ ToolCard 接真实 API
6. ✅ Reddit 页面接 System Prompt
7. ✅ 验证构建成功

---

**Plan 文件位置:** `docs/plans/2026-04-02-api-integration-implementation-plan.md`
**Design 文件位置:** `docs/plans/2026-04-02-api-integration-design.md`
