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

interface TweetCardProps {
  tweet: SerperResult;
  productInfo: string;
  onGenerateComment: (tweet: SerperResult) => void;
  generatingComment: boolean;
  generatedComment: string;
  onCopyComment: () => void;
  loading: boolean;
}

function TweetCard({
  tweet,
  productInfo,
  onGenerateComment,
  generatingComment,
  generatedComment,
  onCopyComment,
  loading,
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
        <Button
          onClick={() => onGenerateComment(tweet)}
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
              生成评论
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="rounded-md bg-muted/50 p-3 text-sm">{generatedComment}</div>
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
  const [query, setQuery] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [searchResults, setSearchResults] = useState<SerperResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<SerperResult | null>(null);
  const [generatedComment, setGeneratedComment] = useState('');
  const [generatingComment, setGeneratingComment] = useState(false);
  const { generate, cancel, loading } = useGenerate();

  async function onSearch() {
    if (!query.trim()) {
      toast.error('请输入搜索关键词');
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setSelectedTweet(null);
    setGeneratedComment('');

    try {
      const results = await searchTwitter(query, { num: 10 });
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

  async function onGenerateComment(tweet: SerperResult) {
    if (!productInfo.trim()) {
      toast.error('请输入产品介绍');
      return;
    }

    setSelectedTweet(tweet);
    setGeneratingComment(true);

    const systemPrompt = `You are a Twitter marketing expert. Generate a natural, non-promotional comment for a tweet, promoting a product without sounding like an ad.

Product Info: ${productInfo}

Tweet Content: ${tweet.title} - ${tweet.snippet}

Requirements:
- Sound like a genuine, helpful response from a real person
- Naturally mention the product without hard selling
- Keep it concise (under 280 characters)
- Don't start with "As a..." or similar generic intros
- Focus on value-add, not product push

Generate one comment in English:`;

    try {
      let fullOutput = '';
      await generate(
        { systemPrompt, productName: '', rawThoughts: '' },
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

  const canSearch = !searching && query.trim().length > 0;

  return (
    <Card className="border-border/60 bg-white shadow-none">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[15px] font-semibold tracking-tight">🔍 搜索推文</div>
          <div className="mt-1 text-sm text-muted-foreground">
            搜索 Twitter 上相关的讨论，生成推广评论
          </div>
        </div>

        {/* Search Input */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-foreground/80">产品关键词</div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：marketing automation, AI tools"
              disabled={searching}
              className="h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-medium text-foreground/80">产品介绍</div>
            <div className="h-[80px] overflow-y-auto rounded-md border border-gray-200 bg-transparent">
              <Textarea
                value={productInfo}
                onChange={(e) => setProductInfo(e.target.value)}
                placeholder="输入你的产品名称、功能、卖点，让 AI 生成更精准的评论..."
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
                  productInfo={productInfo}
                  onGenerateComment={onGenerateComment}
                  generatingComment={generatingComment && selectedTweet?.link === tweet.link}
                  generatedComment={selectedTweet?.link === tweet.link ? generatedComment : ''}
                  onCopyComment={onCopyComment}
                  loading={loading}
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
