import { useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import SearchTweetsCard from '@/components/tools/SearchTweetsCard';
import { cn } from '@/lib/utils';

type ToolDef = {
  id: string;
  title: string;
  shortName: string;
  description: string;
};

export default function Twitter() {
  const tools: ToolDef[] = useMemo(
    () => [
      {
        id: 'twitter-search-tweets',
        title: '🔍 搜索推文',
        shortName: '🔍 搜索推文',
        description: '搜索 Twitter 上相关的讨论，生成推广评论',
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
                <SearchTweetsCard />
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
