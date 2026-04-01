// DESIGN MEMORY (Notion Aesthetic)
// - Sidebar 像 Notion 一样：细边框、轻灰背景、紧凑层级
// - Active 状态用极浅底色 + 轻描边，不使用强烈高亮

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

export default function Sidebar() {
  return (
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
        <NavItem href="/system/settings" icon={Settings} label="⚙️ Settings" />
      </NavGroup>

      <div className="mt-6 px-3">
        <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-[12px] text-muted-foreground">
          提示：第一阶段只实现 Reddit 两个工具卡，其余入口为预留占位。
        </div>
      </div>
    </div>
  );
}
