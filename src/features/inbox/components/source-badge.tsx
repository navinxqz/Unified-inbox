import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { channelById } from "@/features/inbox/data";
import type { ChannelId } from "@/features/inbox/types";

export function SourceBadge({ channel }: { channel: ChannelId }) {
  const source = channelById[channel];

  return (
    <span
      role="img"
      aria-label={source.label}
      title={source.label}
      className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border border-white text-white shadow-sm"
      style={{ backgroundColor: source.color }}
    >
      <ChannelIcon channel={channel} className="size-2.5 text-white" />
    </span>
  );
}
