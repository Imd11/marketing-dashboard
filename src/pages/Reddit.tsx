import { useMemo, useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import ToolCard from '@/components/tools/ToolCard';
import ReplyToCommentCard from '@/components/tools/ReplyToCommentCard';
import CommentPromotionCard from '@/components/tools/CommentPromotionCard';
import { cn } from '@/lib/utils';
import {
  HELP_POST_SYSTEM,
  DM_PROMOTION_SYSTEM,
  PROMOTION_POST_SYSTEM,
  REPLY_TO_COMMENT_SYSTEM,
  COMMENT_PROMOTION_SYSTEM,
} from '@/prompts/reddit';

type ToolDef = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  systemPrompt: string;
  component: 'tool' | 'reply' | 'comment';
};

export default function Reddit() {
  const tools: ToolDef[] = useMemo(
    () => [
      {
        id: 'reddit-help-post',
        title: '❓ Reddit求助帖',
        shortName: '❓ Reddit求助帖',
        description: '把你的中文问题改写成适合发布在 Reddit 的英文提问贴。',
        systemPrompt: HELP_POST_SYSTEM,
        component: 'tool',
      },
      {
        id: 'reddit-dm-promotion',
        title: '📨 Reddit私信DM推广',
        shortName: '📨 Reddit私信DM推广',
        description: '撰写看起来不像广告的 Reddit 私信，获取真实用户反馈。',
        systemPrompt: DM_PROMOTION_SYSTEM,
        component: 'tool',
      },
      {
        id: 'reddit-promotion-post',
        title: '🚀 Reddit推广贴',
        shortName: '🚀 Reddit推广贴',
        description: '将 PRD 转化为极具传播力的"个人极客故事"风格的 Reddit 推广贴。',
        systemPrompt: PROMOTION_POST_SYSTEM,
        component: 'tool',
      },
      {
        id: 'reddit-reply-to-comment',
        title: '💭 再回复',
        shortName: '💭 再回复',
        description: '基于原帖内容和网友评论，生成自然的回复。',
        systemPrompt: REPLY_TO_COMMENT_SYSTEM,
        component: 'reply',
      },
      {
        id: 'reddit-comment-promotion',
        title: '💬 评论区推广',
        shortName: '💬 评论区推广',
        description: '基于帖子内容生成自然的产品推广评论，直接可粘贴到评论区',
        systemPrompt: COMMENT_PROMOTION_SYSTEM,
        component: 'comment',
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
                {tool.component === 'tool' && (
                  <ToolCard
                    toolId={tool.id}
                    title={tool.title}
                    description={tool.description}
                    systemPrompt={tool.systemPrompt}
                  />
                )}
                {tool.component === 'reply' && (
                  <ReplyToCommentCard
                    toolId={tool.id}
                    title={tool.title}
                    description={tool.description}
                    systemPrompt={tool.systemPrompt}
                  />
                )}
                {tool.component === 'comment' && (
                  <CommentPromotionCard
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
