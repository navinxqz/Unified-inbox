import type { ActivitySource, ModuleId } from "@/features/inbox/types";

/** Callbacks every module page can use to stay wired into the workspace. */
export type ModuleActions = {
  onNavigate: (module: ModuleId) => void;
  logActivity: (
    action: string,
    subject: string,
    source?: ActivitySource,
    actor?: string,
  ) => void;
  pushNotification: (input: {
    kind: "waiting" | "past-target" | "never-answered" | "order" | "system";
    title: string;
    body: string;
  }) => void;
};
