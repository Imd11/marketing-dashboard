import { useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import SearchTweetsCard from '@/components/tools/SearchTweetsCard';
import ResearchPostsCard from '@/components/tools/ResearchPostsCard';
import ProductLaunchCard from '@/components/tools/ProductLaunchCard';
import { cn } from '@/lib/utils';
import { RESEARCH_POST_SYSTEM, PRODUCT_LAUNCH_SYSTEM } from '@/prompts/twitter';

type ToolDef = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  systemPrompt?: string;
  component: 'search' | 'research' | 'launch';
};

export default function Twitter() {
  const tools: ToolDef[] = useMemo(
    () => [
      {
        id: 'twitter-search-tweets',
        title: '🔍 搜索推文',
        shortName: '🔍 搜索推文',
        description: '搜索 Twitter 上相关的讨论，生成推广评论',
        component: 'search',
      },
      {
        id: 'twitter-research-posts',
        title: '📊 调研帖子',
        shortName: '📊 调研帖子',
        description: '生成调研型推文，引发用户讨论和反馈',
        systemPrompt: RESEARCH_POST_SYSTEM,
        component: 'research',
      },
      {
        id: 'twitter-product-launch',
        title: '🚀 产品发布',
        shortName: '🚀 产品发布',
        description: '生成产品发布推文，正式向用户介绍产品',
        systemPrompt: PRODUCT_LAUNCH_SYSTEM,
        component: 'launch',
      },
    ],
    []
  );

  const [activeToolId, setActiveToolId] = useState<string>(tools[0]?.id);

  return (
    <AppShell title='营销阵地' subtitle='Twitter (X)'>
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
                    !active && 'hover:bg-gray-50 hover:text-foreground',
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
          {tools.map((tool) => {
            const isActive = tool.id === activeToolId;
            return (
              <div key={tool.id} className={cn(!isActive && 'hidden')}>
                {tool.component === 'search' && <SearchTweetsCard />}
                {tool.component === 'research' && (
                  <ResearchPostsCard
                    toolId={tool.id}
                    title={tool.title}
                    description={tool.description}
                    systemPrompt={tool.systemPrompt || ''}
                  />
                )}
                {tool.component === 'launch' && (
                  <ProductLaunchCard
                    toolId={tool.id}
                    title={tool.title}
                    description={tool.description}
                    systemPrompt={tool.systemPrompt || ''}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
