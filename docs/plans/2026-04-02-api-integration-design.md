# Marketing Growth Dashboard - API Integration Design

## 概述

为 Marketing Growth Dashboard 接入 DeepSeek LLM API，实现流式内容生成。保持可扩展结构，支持多平台、多工具。

## 技术栈

- **前端框架：** Vite + React + TypeScript
- **路由：** wouter (hash mode)
- **UI 组件：** shadcn/ui
- **LLM 提供商：** DeepSeek (deepseek-chat)
- **API 格式：** OpenAI 兼容格式

## 项目结构

```
src/
├── lib/
│   └── api/
│       └── deepseek.ts         # DeepSeek API 调用封装 (流式)
├── prompts/
│   ├── index.ts                 # 统一导出所有 Prompt
│   └── reddit/
│       ├── post-refiner.ts      # System Prompt
│       └── smart-replier.ts
└── hooks/
    └── useGenerate.ts            # 生成逻辑 Hook
```

### 目录说明

| 目录 | 职责 |
|------|------|
| `lib/api/` | API 调用封装，处理流式响应 |
| `prompts/` | System Prompt 配置，按平台/工具组织 |
| `hooks/` | 可复用的 React Hooks |

## API 设计

### DeepSeek API 调用

```typescript
POST https://api.deepseek.com/v1/chat/completions

Headers:
  Content-Type: application/json
  Authorization: Bearer {API_KEY}

Body:
{
  "model": "deepseek-chat",
  "messages": [
    {"role": "system", "content": "{system_prompt}"},
    {"role": "user", "content": "产品名称: {productName}\n原始想法: {rawThoughts}"}
  ],
  "stream": true
}
```

### 流式响应处理

- 使用 `fetch` + `ReadableStream` 解析 SSE
- 按 `data: ` 前缀解析每个 chunk
- 过滤 `[DONE]` 终止信号

### API 配置

```typescript
// src/lib/api/config.ts
export const API_CONFIG = {
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  apiKey: 'sk-0472bbc337b747eab9cf7e1bd703a012',
};
```

## Prompt 管理

### 文件结构

```
prompts/
├── index.ts                    # 统一导出
├── reddit/
│   ├── index.ts                # Reddit 平台统一导出
│   ├── post-refiner.ts         # post-refiner System Prompt
│   └── smart-replier.ts        # smart-replier System Prompt
```

### Prompt 导出格式

```typescript
// src/prompts/reddit/post-refiner.ts
export const POST_REFINDER_SYSTEM = `你的 System Prompt 内容...`;

export const postRefinerMeta = {
  id: 'reddit-post-refiner',
  name: '帖子神策手',
  description: '把你的原始想法重写成可直接发布的 Reddit 帖子结构。',
};
```

### 扩展新平台

添加新平台时，只需：

1. 在 `prompts/` 下创建新目录，如 `twitter/`
2. 添加对应工具的 System Prompt 文件
3. 在 `prompts/index.ts` 中统一导出

## 前端集成

### useGenerate Hook

```typescript
// src/hooks/useGenerate.ts
export function useGenerate() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate(params: {
    systemPrompt: string;
    productName: string;
    rawThoughts: string;
  }) {
    setLoading(true);
    setOutput('');

    // 调用流式 API，实时更新 output
    await streamGenerate(params, (chunk) => {
      setOutput((prev) => prev + chunk);
    });

    setLoading(false);
  }

  return { output, loading, generate };
}
```

### ToolCard 集成

```typescript
// ToolCard.tsx 修改
import { useGenerate } from '@/hooks/useGenerate';
import { POST_REFINDER_SYSTEM } from '@/prompts/reddit/post-refiner';

function ToolCard({ toolId, systemPrompt, ... }) {
  const { output, loading, generate } = useGenerate();

  async function onGenerate() {
    await generate({
      systemPrompt,
      productName,
      rawThoughts,
    });
  }

  // 渲染时 output 实时更新
}
```

## 流式输出实现

### SSE 解析

```typescript
async function streamGenerate(
  params: GenerateParams,
  onChunk: (text: string) => void
) {
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
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // 解析 SSE 行
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        const delta = JSON.parse(data).choices[0]?.delta?.content;
        if (delta) onChunk(delta);
      }
    }
  }
}
```

## 扩展性设计

### 添加新平台

1. 创建 `src/prompts/{platform}/` 目录
2. 添加各工具的 System Prompt 文件
3. 在对应页面使用

### 添加新工具

1. 在对应平台的 `prompts/` 目录下添加新的 prompt 文件
2. 在工具组件中导入并使用

## 状态管理

- **局部状态：** `useState` 管理各 ToolCard 的输入/输出/加载状态
- **无需全局状态：** 各工具独立，不共享状态
- **API Key：** 客户端直接使用，暂不考虑后端代理

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| API 请求失败 | Toast 提示错误，清除输出 |
| 网络中断 | 展示已获取内容 + 错误提示 |
| API Key 无效 | Toast 提示配置错误 |
| 流式中断 | 保留已显示内容 |

## 实现计划

1. 创建 `lib/api/` 目录，封装 DeepSeek API 调用
2. 创建 `prompts/` 目录结构，添加 Reddit 工具的 System Prompt 占位符
3. 创建 `useGenerate` Hook
4. 修改 `ToolCard` 组件，接入真实 API
5. 验证流式输出正常
6. 构建测试
