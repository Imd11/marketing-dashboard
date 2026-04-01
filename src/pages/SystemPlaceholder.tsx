import AppShell from "@/components/shell/AppShell";
import { Card } from "@/components/ui/card";

export default function SystemPlaceholder() {
  return (
    <AppShell title="系统" subtitle="Settings（预留）">
      <Card className="border-border/60 shadow-none">
        <div className="p-6">
          <div className="text-sm font-medium">⚙️ Settings</div>
          <div className="mt-2 text-sm text-muted-foreground">
            这里后续用于配置全局变量（例如品牌语气、产品卖点、目标受众、Prompt 模板等）。
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
