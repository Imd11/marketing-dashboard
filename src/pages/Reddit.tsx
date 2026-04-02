import { useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import ToolCard from '@/components/tools/ToolCard';
import ReplyToCommentCard from '@/components/tools/ReplyToCommentCard';
import { cn } from '@/lib/utils';
import {
  POST_REFINDER_SYSTEM,
  SMART_REPLIER_SYSTEM,
  HELP_POST_SYSTEM,
  DM_PROMOTION_SYSTEM,
  PROMOTION_POST_SYSTEM,
  REPLY_TO_COMMENT_SYSTEM,
} from '@/prompts/reddit';

type ToolDef = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  systemPrompt: string;
  has3Inputs?: boolean;
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
      {
        id: 'reddit-help-post',
        title: '❓ Reddit求助帖',
        shortName: '❓ Reddit求助帖',
        description: '把你的中文问题改写成适合发布在 Reddit 的英文提问贴。',
        systemPrompt: HELP_POST_SYSTEM,
      },
      {
        id: 'reddit-dm-promotion',
        title: '📨 Reddit私信DM推广',
        shortName: '📨 Reddit私信DM推广',
        description: '撰写看起来不像广告的 Reddit 私信，获取真实用户反馈。',
        systemPrompt: DM_PROMOTION_SYSTEM,
      },
      {
        id: 'reddit-promotion-post',
        title: '🚀 Reddit推广贴',
        shortName: '🚀 Reddit推广贴',
        description: '将 PRD 转化为极具传播力的"个人极客故事"风格的 Reddit 推广贴。',
        systemPrompt: PROMOTION_POST_SYSTEM,
      },
      {
        id: 'reddit-reply-to-comment',
        title: '💭 再回复',
        shortName: '💭 再回复',
        description: '基于原帖内容和网友评论，生成自然的回复。',
        systemPrompt: REPLY_TO_COMMENT_SYSTEM,
        has3Inputs: true,
      },
    ],
    []
  );

  const [activeToolId, setActiveToolId] = useState<string>(tools[0]?.id);

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
          {tools.map((tool) => {
            const isActive = tool.id === activeToolId;
            return (
              <div key={tool.id} className={cn(!isActive && 'hidden')}>
                {tool.has3Inputs ? (
                  <ReplyToCommentCard
                    toolId={tool.id}
                    title={tool.title}
                    description={tool.description}
                    systemPrompt={tool.systemPrompt}
                  />
                ) : (
                  <ToolCard
                    toolId={tool.id}
                    title={tool.title}
                    description={tool.description}
                    systemPrompt={tool.systemPrompt}
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
