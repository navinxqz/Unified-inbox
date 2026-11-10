import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import type { ChannelId } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

export function ChannelDot({
  color,
  channel,
  className,
}: {
  color?: string;
  channel?: ChannelId | "all";
  className?: string;
}) {
  if (channel && channel !== "all") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md text-white shadow-xs",
          className,
        )}
        style={{ backgroundColor: color }}
      >
        <ChannelIcon channel={channel} className="size-3 text-white" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  );
}
