import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md";

export type AvatarProps = {
  initials: string;
  background: string;
  color: string;
  size?: AvatarSize;
  className?: string;
};

const sizeStyles: Record<AvatarSize, string> = {
  sm: "size-7 text-[11px]",
  md: "size-10 text-sm",
};

export function Avatar({
  initials,
  background,
  color,
  size = "md",
  className,
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        sizeStyles[size],
        className,
      )}
      style={{ backgroundColor: background, color }}
    >
      {initials}
    </span>
  );
}
