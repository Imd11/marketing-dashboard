import AppShell from "@/components/shell/AppShell";
import { Card } from "@/components/ui/card";

const CHANNEL_LABELS: Record<string, string> = {
  twitter: "Twitter (X)",
  reddit: "Reddit",
  facebook: "Facebook",
  xiaohongshu: "小红书",
  linkedin: "LinkedIn",
  producthunt: "Product Hunt",
};

export default function ChannelPlaceholder({ channel }: { channel: string }) {
  const name = CHANNEL_LABELS[channel] ?? channel;

  return (
    <AppShell title="营销阵地" subtitle={name}>
      <Card className="border-border/60 shadow-none">
        <div className="p-6">
          <div className="text-sm font-medium">🚧 功能预留</div>
          <div className="mt-2 text-sm text-muted-foreground">
            「{name}」频道工具层正在施工中。你可以先查看 Reddit 的两个打样工具卡。
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
