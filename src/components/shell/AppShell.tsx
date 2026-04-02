// DESIGN MEMORY (Notion Aesthetic)
// - 纯白底 + 极浅边框 + 克制阴影
// - 排版轻量、信息层级清晰，避免艳色和夸张动效
// - 交互只做“可感知但不抢戏”的反馈

import Sidebar from "@/components/shell/Sidebar";

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-[272px] shrink-0 border-r border-black/20 bg-white">
          <Sidebar />
        </aside>

        <main className="flex-1">
          <div className="flex min-h-screen w-full flex-col px-6 py-8 md:pl-8">
            <header className="mb-8">
              <div className="text-[13px] text-muted-foreground">Marketing Growth Dashboard</div>
              <div className="mt-1 flex items-baseline gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle ? (
                  <div className="text-sm text-muted-foreground">/ {subtitle}</div>
                ) : null}
              </div>
            </header>

            <section className="flex-1 space-y-5">{children}</section>
          </div>
        </main>
      </div>
    </div>
  );
}
