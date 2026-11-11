"use client";

import { Check, Info, ShieldCheck, Users } from "lucide-react";

import { ModuleShell, Pill, SectionCard } from "@/features/inbox/components/module-ui";
import { initialGroups, permissionCatalog } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { GroupDef } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type GroupsProps = {
  logActivity: (action: string, subject: string) => void;
};

export function GroupsModule({ logActivity }: GroupsProps) {
  const [groups, setGroups] = useStoredState<GroupDef[]>(
    MODULE_STORAGE_KEYS.groups,
    initialGroups,
  );

  function togglePermission(
    group: GroupDef,
    kind: "canDo" | "canSee",
    permission: string,
  ) {
    const list = group[kind];
    const next = list.includes(permission)
      ? list.filter((item) => item !== permission)
      : [...list, permission];

    setGroups(
      groups.map((item) => (item.id === group.id ? { ...item, [kind]: next } : item)),
    );
    logActivity(
      `${list.includes(permission) ? "removed" : "granted"} “${permission}” for the ${group.name} group`,
      "Groups",
    );
  }

  return (
    <ModuleShell
      title="Groups"
      subtitle="Ready-made permission groups — what each one can do and what each one can see."
      walkthrough={{
        title: "Understand permissions",
        steps: [
          "A teammate belongs to one group; can-do and can-see are set per group.",
          "If a teammate has two overlapping grants anywhere, the most generous one wins.",
          "The owner sits outside every group and always has full access.",
          "Ready-made groups cover Manager, Inbox, Orders, Products, and Accounts.",
        ],
      }}
    >
      <div className="flex flex-wrap items-start gap-2 rounded-xl border border-border bg-surface/60 p-3 text-[12px] text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <b className="text-foreground">Most generous wins.</b> When a permission is
          granted anywhere for a teammate, it is granted everywhere for them. Groups
          never take access away.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <SectionCard key={group.id} title={group.name} description={group.description}>
            <div className="flex flex-wrap items-center gap-1.5 pb-2.5">
              <Pill tone={group.system ? "primary" : "neutral"}>
                {group.system ? "Ready-made" : "Custom"}
              </Pill>
              <Pill tone="neutral">
                <Users className="size-3" />
                {group.members} member{group.members === 1 ? "" : "s"}
              </Pill>
            </div>

            <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              Can do
            </p>
            <div className="mb-2.5 flex flex-wrap gap-1">
              {permissionCatalog.canDo.map((permission) => {
                const active = group.canDo.includes(permission);
                return (
                  <button
                    key={permission}
                    type="button"
                    onClick={() => togglePermission(group, "canDo", permission)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary-soft text-primary-strong"
                        : "border-border text-muted-foreground hover:bg-surface",
                    )}
                  >
                    {active ? <Check className="size-3" /> : null}
                    {permission}
                  </button>
                );
              })}
            </div>

            <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              Can see
            </p>
            <div className="flex flex-wrap gap-1">
              {permissionCatalog.canSee.map((permission) => {
                const active = group.canSee.includes(permission);
                return (
                  <button
                    key={permission}
                    type="button"
                    onClick={() => togglePermission(group, "canSee", permission)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      active
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-border text-muted-foreground hover:bg-surface",
                    )}
                  >
                    {active ? <Check className="size-3" /> : null}
                    {permission}
                  </button>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Owner access" description="Always outside groups.">
        <p className="inline-flex items-start gap-2 text-[13px] text-ink-soft">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          The workspace owner always has full access — billing, team, groups, and every
          page — regardless of group membership.
        </p>
      </SectionCard>
    </ModuleShell>
  );
}
