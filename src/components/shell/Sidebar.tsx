// DESIGN MEMORY (Notion Aesthetic)
// - Sidebar 像 Notion 一样：细边框、轻灰背景、紧凑层级
// - Active 状态用极浅底色 + 轻描边，不使用强烈高亮

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Settings,
  Bird,
  Ghost,
  Globe,
  BriefcaseBusiness,
  Cat,
  Rabbit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { PROVIDERS, type ApiProvider } from "@/lib/api/config";
import { useApiProviderStore } from "@/lib/api/useApiProviderStore";
import { Check } from "lucide-react";

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pt-4 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const [location] = useLocation();
  const active = location === href;

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-2 text-[15px]",
        "text-foreground/85 hover:bg-muted/60 hover:text-foreground",
        active && "bg-muted/70 text-foreground ring-1 ring-border/50"
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] text-foreground/60 group-hover:text-foreground/75", active && "text-foreground/80")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-2 text-[15px] w-full",
        "text-foreground/85 hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] text-foreground/60 group-hover:text-foreground/75")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function SettingsContent() {
  const { provider, setProvider } = useApiProviderStore();

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">API 提供商</div>
      <div className="text-sm text-muted-foreground">
        选择全局使用的 LLM API 提供商
      </div>

      <div className="space-y-3">
        {(Object.keys(PROVIDERS) as ApiProvider[]).map((key) => {
          const config = PROVIDERS[key];
          const selected = provider === key;

          return (
            <button
              key={key}
              onClick={() => setProvider(key)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-all",
                selected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {config.baseUrl}
                  </div>
                  <div className="text-xs text-muted-foreground">
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
  );
}

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="mb-2">
            <div className="text-lg font-semibold">Settings</div>
            <div className="text-sm text-muted-foreground">系统设置</div>
          </div>
          <SettingsContent />
        </DialogContent>
      </Dialog>

      <div className="h-full px-2 py-4">
        <div className="px-3 pb-3">
          <div className="text-[15px] font-semibold leading-tight">Marketing Growth</div>
          <div className="mt-1 text-[13px] text-muted-foreground leading-snug">
            内容生产引擎 · 发布中枢
          </div>
        </div>

        <NavGroup title="概览">
          <NavItem href="/overview/dashboard" icon={LayoutDashboard} label="📊 Dashboard" />
        </NavGroup>

        <NavGroup title="营销阵地">
          <div className="space-y-1">
            <NavItem href="/channels/twitter" icon={Bird} label="🐦 Twitter (X)" />
            <NavItem href="/channels/reddit" icon={Ghost} label="👾 Reddit" />
            <NavItem href="/channels/facebook" icon={Globe} label="📘 Facebook" />
            <NavItem href="/channels/xiaohongshu" icon={Rabbit} label="📕 小红书" />
            <NavItem href="/channels/linkedin" icon={BriefcaseBusiness} label="💼 LinkedIn" />
            <NavItem href="/channels/producthunt" icon={Cat} label="🐱 Product Hunt" />
          </div>
        </NavGroup>

        <NavGroup title="系统">
          <NavButton icon={Settings} label="⚙️ Settings" onClick={() => setSettingsOpen(true)} />
        </NavGroup>

        <div className="mt-6 px-3">
          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-[12px] text-muted-foreground">
            提示：第一阶段只实现 Reddit 两个工具卡，其余入口为预留占位。
          </div>
        </div>
      </div>
    </>
  );
}
