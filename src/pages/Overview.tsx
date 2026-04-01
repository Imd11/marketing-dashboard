import AppShell from "@/components/shell/AppShell";
import { Card } from "@/components/ui/card";

export default function Overview() {
  return (
    <AppShell title="概览" subtitle="Dashboard（预留）">
      <Card className="border-border/60 shadow-none">
        <div className="p-6">
          <div className="text-sm font-medium">📊 Dashboard</div>
          <div className="mt-2 text-sm text-muted-foreground">
            这里后续用于展示关键指标、渠道表现、内容产出节奏等统计数据。
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
