import AppShell from '@/components/shell/AppShell';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PROVIDERS, type ApiProvider } from '@/lib/api/config';
import { useApiProviderStore } from '@/lib/api/useApiProviderStore';
import { Check } from 'lucide-react';

export default function Settings() {
  const { provider, setProvider } = useApiProviderStore();

  return (
    <AppShell title='系统' subtitle='Settings'>
      <div className='space-y-6'>
        {/* API Provider Selection */}
        <Card className='border-border/60 shadow-none'>
          <div className='p-6'>
            <div className='text-sm font-medium'>API 提供商</div>
            <div className='mt-2 text-sm text-muted-foreground'>
              选择全局使用的 LLM API 提供商
            </div>

            <div className='mt-4 space-y-3 max-w-md'>
              {(Object.keys(PROVIDERS) as ApiProvider[]).map((key) => {
                const config = PROVIDERS[key];
                const selected = provider === key;

                return (
                  <button
                    key={key}
                    onClick={() => setProvider(key)}
                    className={cn(
                      'w-full rounded-lg border p-4 text-left transition-all',
                      selected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    )}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium'>{config.name}</div>
                        <div className='text-xs text-muted-foreground mt-1'>
                          {config.baseUrl}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Model: {config.model}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                          selected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 bg-white'
                        )}
                      >
                        {selected && <Check className='h-3 w-3' strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
