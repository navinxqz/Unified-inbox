import { channelById } from "@/features/inbox/data";
import type { ChannelId } from "@/features/inbox/types";

export function SourceBadge({ channel }: { channel: ChannelId }) {
  const source = channelById[channel];

  return (
    <span
      role="img"
      aria-label={source.label}
      title={source.label}
      className="absolute -right-0.5 -bottom-0.5 flex size-[18px] items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
      style={{ backgroundColor: source.color }}
    >
      {source.short}
    </span>
  );
}
