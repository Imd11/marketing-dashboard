import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Search, ExternalLink, Copy, MessageSquare, Sparkles } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { searchTwitter, type SerperResult } from '@/lib/api/serper';
import { scrapeUrl } from '@/lib/api/jina';
import { useGenerate } from '@/hooks/useGenerate';
import { TWITTER_DISCUSSION_SYSTEM, KEYWORD_GENERATE_SYSTEM } from '@/prompts/twitter';
import { cn } from '@/lib/utils';

const toneTags = ['感谢', '思考', '洞察', '共鸣', '提问'] as const;
const lengthOptions = [
  { value: 'short', label: '短' },
  { value: 'medium', label: '中' },
  { value: 'long', label: '长' },
];

export default function SearchTweetsCard() {
  const [productUrl, setProductUrl] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SerperResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<SerperResult | null>(null);
  const [generatedComment, setGeneratedComment] = useState('');
  const [generatingComment, setGeneratingComment] = useState(false);
  const { generate } = useGenerate();

  // 关键词生成
  const [generatingKeywords, setGeneratingKeywords] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // 语气和长度
  const [selectedTone, setSelectedTone] = useState<string>('共鸣');
  const [selectedLength, setSelectedLength] = useState<string>('medium');

  async function onGenerateKeywords() {
    if (!productUrl.trim() && !productInfo.trim()) {
      toast.error('请输入产品网址或产品介绍');
      return;
    }

    setGeneratingKeywords(true);
    setGeneratedKeywords([]);
    setSelectedKeywords([]);

    let scrapedContent = '';

    if (productUrl.trim()) {
      try {
        toast.info('正在抓取产品页面...');
        scrapedContent = await scrapeUrl(productUrl.trim());
      } catch (error) {
        console.warn('Jina scrape failed, using URL only:', error);
        scrapedContent = `产品网址: ${productUrl}`;
      }
    }

    const resolvedPrompt = KEYWORD_GENERATE_SYSTEM
      .replace(/\{\{产品网址\}\}/g, scrapedContent || '未提供')
      .replace(/\{\{产品介绍\}\}/g, productInfo);

    try {
      let fullOutput = '';
      await generate(
        { systemPrompt: resolvedPrompt, productName: '', rawThoughts: '' },
        (chunk) => {
          fullOutput += chunk;
          const lines = fullOutput.split('\n').filter((line) => line.trim().length > 0);
          setGeneratedKeywords(lines);
        }
      );
      toast.success('关键词已生成');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('关键词生成失败');
      }
    } finally {
      setGeneratingKeywords(false);
    }
  }

  function toggleKeyword(keyword: string) {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  }

  async function onSearch() {
    const queryToUse = selectedKeywords.length > 0 ? selectedKeywords[0] : searchQuery;

    if (!queryToUse.trim()) {
      toast.error('请选择或输入搜索关键词');
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setSelectedTweet(null);
    setGeneratedComment('');

    try {
      const results = await searchTwitter(queryToUse, { num: 10 });
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

  async function onGenerateComment() {
    if (!selectedTweet) {
      toast.error('请先选择一个帖子');
      return;
    }

    if (!productInfo.trim()) {
      toast.error('请输入产品介绍');
      return;
    }

    setGeneratingComment(true);

    const resolvedPrompt = TWITTER_DISCUSSION_SYSTEM
      .replace(/\{\{产品网址\}\}/g, productUrl || '未提供')
      .replace(/\{\{产品介绍\}\}/g, productInfo)
      .replace(/\{\{帖子内容\}\}/g, `${selectedTweet.snippet || selectedTweet.title}`)
      .replace(/\{\{语气标签\}\}/g, selectedTone)
      .replace(/\{\{回复长度\}\}/g, lengthOptions.find((l) => l.value === selectedLength)?.label || '中');

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

  const canSearch = !searching && (selectedKeywords.length > 0 || searchQuery.trim().length > 0);
  const canGenerateKeywords = !generatingKeywords && (productUrl.trim().length > 0 || productInfo.trim().length > 0);
  const canGenerate = !generatingComment && selectedTweet && productInfo.trim().length > 0;

  return (
    <Card className="border-border/60 bg-white shadow-none">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[15px] font-semibold tracking-tight">🔍 搜索推文</div>
          <div className="mt-1 text-sm text-muted-foreground">
            搜索 Twitter 上的目标用户讨论，生成讨论型回复（市场调研）
          </div>
        </div>

        {/* Product Info Input */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-foreground/80">产品网址</div>
              <Input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://your-product.com"
                disabled={searching || generatingKeywords}
                className="h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25"
              />
            </div>
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-foreground/80">产品介绍</div>
              <Input
                value={productInfo}
                onChange={(e) => setProductInfo(e.target.value)}
                placeholder="产品名称、功能、卖点..."
                disabled={searching || generatingKeywords}
                className="h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25"
              />
            </div>
          </div>

          {/* AI 生成关键词按钮 */}
          <Button
            onClick={onGenerateKeywords}
            disabled={!canGenerateKeywords}
            variant="outline"
            className="w-full gap-2"
          >
            {generatingKeywords ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 生成关键词中…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI 生成精准关键词
              </>
            )}
          </Button>

          {/* 生成的关键词展示 */}
          {generatedKeywords.length > 0 && (
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-foreground/80">
                AI 生成的关键词（点击选择一个）
              </div>
              <div className="flex flex-wrap gap-2">
                {generatedKeywords.map((keyword, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleKeyword(keyword)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      selectedKeywords.includes(keyword)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
                    )}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 搜索框和搜索按钮 */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedKeywords([]);
              }}
              placeholder="或直接输入搜索关键词..."
              disabled={searching}
              className="flex-1 h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-foreground/25"
            />
            <Button
              onClick={onSearch}
              disabled={!canSearch}
              className="gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  搜索中…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  搜索
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Results - List only */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-foreground/80">
              搜索结果 ({searchResults.length})，点击选择一个帖子
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
              {searchResults.map((tweet) => (
                <button
                  key={tweet.link}
                  type="button"
                  onClick={() => {
                    setSelectedTweet(tweet);
                    setGeneratedComment('');
                  }}
                  className={cn(
                    'w-full text-left rounded-md px-3 py-2 transition-colors',
                    selectedTweet?.link === tweet.link
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-gray-50 border border-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tweet.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {tweet.snippet || tweet.title}
                      </p>
                    </div>
                    {selectedTweet?.link === tweet.link && (
                      <span className="text-xs text-primary shrink-0">已选择</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Master-Detail Layout */}
        {selectedTweet && (
          <div className="border-t border-border pt-6">
            <div className="text-[12px] font-medium text-foreground/80 mb-3">
              生成讨论回复
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: 操作区 */}
              <div className="space-y-4">
                {/* 帖子信息 */}
                <div className="rounded-md border border-gray-200 p-4 space-y-2">
                  <div className="text-[12px] font-medium text-foreground/80">帖子内容</div>
                  <p className="text-sm leading-relaxed">{selectedTweet.snippet || selectedTweet.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{selectedTweet.date || '未知日期'}</span>
                    <a
                      href={selectedTweet.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      打开原帖
                    </a>
                  </div>
                </div>

                {/* 语气选择 */}
                <div className="space-y-2">
                  <div className="text-[12px] font-medium text-foreground/80">语气</div>
                  <div className="flex gap-2 flex-wrap">
                    {toneTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTone(tag)}
                        disabled={generatingComment}
                        className={cn(
                          'px-3 py-1 text-xs rounded-full border transition-colors',
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

                {/* 长短选择 */}
                <div className="space-y-2">
                  <div className="text-[12px] font-medium text-foreground/80">长短</div>
                  <div className="flex gap-2">
                    {lengthOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedLength(option.value)}
                        disabled={generatingComment}
                        className={cn(
                          'px-3 py-1 text-xs rounded-full border transition-colors',
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

                {/* 生成按钮 */}
                <Button
                  onClick={onGenerateComment}
                  disabled={!canGenerate}
                  className="w-full gap-2"
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
              </div>

              {/* Right: 输出区 */}
              <div className="relative">
                <div className="absolute right-0 top-0 flex gap-2">
                  {generatedComment && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCopyComment}
                      className="h-8 gap-1.5 border-black/20 bg-white/70 backdrop-blur"
                    >
                      <Copy className="h-4 w-4" />
                      复制
                    </Button>
                  )}
                </div>

                <div className="rounded-md border border-black/20 bg-muted/30 p-4 h-[300px] overflow-y-auto">
                  {generatedComment ? (
                    <div className="prose prose-xs max-w-none prose-headings:tracking-tight prose-p:leading-relaxed">
                      <Streamdown>{generatedComment}</Streamdown>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm h-full flex items-center justify-center">
                      {generatingComment ? '生成中…' : '选择帖子并点击生成后，结果将显示在这里'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !searching && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            输入产品信息，AI 生成精准关键词，再搜索目标用户讨论
          </div>
        )}
      </div>
    </Card>
  );
}
