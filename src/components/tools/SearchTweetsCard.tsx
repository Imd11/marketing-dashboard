import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Search, ExternalLink, Copy, MessageSquare } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { searchTwitter, type SerperResult } from '@/lib/api/serper';
import { useGenerate } from '@/hooks/useGenerate';
import { TWITTER_DISCUSSION_SYSTEM } from '@/prompts/twitter';
import { cn } from '@/lib/utils';

const toneTags = ['感谢', '思考', '洞察', '共鸣', '提问'] as const;
const lengthOptions = [
  { value: 'short', label: '短' },
  { value: 'medium', label: '中' },
  { value: 'long', label: '长' },
];

interface TweetCardProps {
  tweet: SerperResult;
  productUrl: string;
  productInfo: string;
  onGenerateComment: (tweet: SerperResult, tone: string, length: string) => void;
  generatingComment: boolean;
  generatedComment: string;
  onCopyComment: () => void;
  selectedTone: string;
  selectedLength: string;
  onToneChange: (tone: string) => void;
  onLengthChange: (length: string) => void;
  disabled: boolean;
}

function TweetCard({
  tweet,
  productUrl,
  productInfo,
  onGenerateComment,
  generatingComment,
  generatedComment,
  onCopyComment,
  selectedTone,
  selectedLength,
  onToneChange,
  onLengthChange,
  disabled,
}: TweetCardProps) {
  return (
    <div className="border border-border/60 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{tweet.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tweet.snippet}</p>
          {tweet.date && <p className="text-xs text-muted-foreground/70 mt-1">{tweet.date}</p>}
        </div>
        <a
          href={tweet.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {!generatedComment ? (
        <>
          {/* 语气和长度选项 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground">语气:</span>
              <div className="flex gap-1 flex-wrap">
                {toneTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToneChange(tag)}
                    disabled={disabled}
                    className={cn(
                      'px-2 py-0.5 text-[11px] rounded-full border transition-colors',
                      selectedTone === tag
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">长短:</span>
              <div className="flex gap-1">
                {lengthOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onLengthChange(option.value)}
                    disabled={disabled}
                    className={cn(
                      'px-2 py-0.5 text-[11px] rounded-full border transition-colors',
                      selectedLength === option.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={() => onGenerateComment(tweet, selectedTone, selectedLength)}
            disabled={generatingComment || !productInfo.trim()}
            size="sm"
            className="w-full gap-1.5"
          >
            {generatingComment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中…
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                生成讨论回复
              </>
            )}
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          <div className="rounded-md bg-muted/50 p-3 text-sm max-h-[200px] overflow-y-auto">
            <Streamdown>{generatedComment}</Streamdown>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCopyComment} size="sm" variant="outline" className="flex-1 gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              复制
            </Button>
            <a
              href={tweet.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                打开原帖
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchTweetsCard() {
  const [productUrl, setProductUrl] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SerperResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<SerperResult | null>(null);
  const [generatedComment, setGeneratedComment] = useState('');
  const [generatingComment, setGeneratingComment] = useState(false);
  const { generate, cancel } = useGenerate();

  // 每个推文的语气和长度选项
  const [tweetTones, setTweetTones] = useState<Record<string, string>>({});
  const [tweetLengths, setTweetLengths] = useState<Record<string, string>>({});

  const getTweetTone = (link: string) => tweetTones[link] || '共鸣';
  const getTweetLength = (link: string) => tweetLengths[link] || 'medium';

  async function onSearch() {
    if (!searchQuery.trim()) {
      toast.error('请输入搜索关键词');
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setSelectedTweet(null);
    setGeneratedComment('');
    setTweetTones({});
    setTweetLengths({});

    try {
      const results = await searchTwitter(searchQuery, { num: 10 });
      setSearchResults(results);
      if (results.length === 0) {
        toast.info('没有找到相关推文，尝试其他关键词');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('搜索失败', { description: error instanceof Error ? error.message : '请检查 Serper API 配置' });
    } finally {
      setSearching(false);
    }
  }

  async function onGenerateComment(tweet: SerperResult, tone: string, length: string) {
    if (!productInfo.trim()) {
      toast.error('请输入产品介绍');
      return;
    }

    setSelectedTweet(tweet);
    setGeneratingComment(true);

    const resolvedPrompt = TWITTER_DISCUSSION_SYSTEM
      .replace(/\{\{产品网址\}\}/g, productUrl || '未提供')
      .replace(/\{\{产品介绍\}\}/g, productInfo)
      .replace(/\{\{帖子内容\}\}/g, `${tweet.title} - ${tweet.snippet}`)
      .replace(/\{\{语气标签\}\}/g, tone)
      .replace(/\{\{回复长度\}\}/g, lengthOptions.find((l) => l.value === length)?.label || '中');

    try {
      let fullOutput = '';
      await generate(
        { systemPrompt: resolvedPrompt, productName: '', rawThoughts: '' },
        (chunk) => {
          fullOutput += chunk;
          setGeneratedComment(fullOutput);
        }
      );
      toast.success('评论已生成');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('生成失败');
      }
    } finally {
      setGeneratingComment(false);
    }
  }

  async function onCopyComment() {
    try {
      await navigator.clipboard.writeText(generatedComment);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  }

  const canSearch = !searching && searchQuery.trim().length > 0;

  return (
    <Card className="border-border/60 bg-white shadow-none">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[15px] font-semibold tracking-tight">🔍 搜索推文</div>
          <div className="mt-1 text-sm text-muted-foreground">
            搜索 Twitter 上的相关讨论，生成讨论型回复（市场调研）
          </div>
        </div>

        {/* Search Input */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-foreground/80">产品网址</div>
              <Input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://your-product.com"
                disabled={searching}
                className="h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25"
              />
            </div>
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-foreground/80">搜索关键词</div>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="例如：marketing automation, AI tools"
                disabled={searching}
                className="h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-foreground/80">产品介绍</div>
            <div className="h-[80px] overflow-y-auto rounded-md border border-gray-200 bg-transparent">
              <Textarea
                value={productInfo}
                onChange={(e) => setProductInfo(e.target.value)}
                placeholder="输入你的产品名称、功能、卖点，用于生成更精准的讨论回复..."
                disabled={generatingComment}
                className="h-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25 resize-none"
              />
            </div>
          </div>

          <Button
            onClick={onSearch}
            disabled={!canSearch}
            className="w-full gap-2"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                搜索中…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                搜索 10 条推文
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <div className="text-[12px] font-medium text-foreground/80">
              搜索结果 ({searchResults.length})
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {searchResults.map((tweet) => (
                <TweetCard
                  key={tweet.link}
                  tweet={tweet}
                  productUrl={productUrl}
                  productInfo={productInfo}
                  onGenerateComment={onGenerateComment}
                  generatingComment={generatingComment && selectedTweet?.link === tweet.link}
                  generatedComment={selectedTweet?.link === tweet.link ? generatedComment : ''}
                  onCopyComment={onCopyComment}
                  selectedTone={getTweetTone(tweet.link)}
                  selectedLength={getTweetLength(tweet.link)}
                  onToneChange={(tone) => setTweetTones((prev) => ({ ...prev, [tweet.link]: tone }))}
                  onLengthChange={(length) => setTweetLengths((prev) => ({ ...prev, [tweet.link]: length }))}
                  disabled={generatingComment}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !searching && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            输入关键词搜索 Twitter 上的相关讨论
          </div>
        )}
      </div>
    </Card>
  );
}
