"use client";

import { useState } from "react";
import { Mail, ShieldCheck, UserPlus, Users, X } from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
} from "@/features/inbox/components/module-ui";
import { initialGroups, initialTeam } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { GroupDef, Teammate } from "@/features/inbox/types";

const roles: Teammate["role"][] = ["Admin", "Member", "Viewer"];

type TeamProps = {
  logActivity: (action: string, subject: string) => void;
};

export function TeamModule({ logActivity }: TeamProps) {
  const [team, setTeam] = useStoredState<Teammate[]>(
    MODULE_STORAGE_KEYS.team,
    initialTeam,
  );
  const [groups] = useStoredState<GroupDef[]>(
    MODULE_STORAGE_KEYS.groups,
    initialGroups,
  );
  const [invite, setInvite] = useState({
    email: "",
    role: "Member" as Teammate["role"],
    group: "Inbox",
  });

  function sendInvite() {
    const email = invite.email.trim().toLowerCase();
    if (!email.includes("@")) return;

    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    setTeam([
      ...team,
      {
        id: `tm-${Date.now()}`,
        name,
        email,
        role: invite.role,
        group: invite.group,
        pages: ["All pages"],
        status: "invited",
      },
    ]);
    logActivity(`invited ${email} to the ${invite.group} group`, "Team");
    setInvite({ email: "", role: "Member", group: "Inbox" });
  }

  function removeMember(member: Teammate) {
    if (member.role === "Owner") return;
    setTeam(team.filter((item) => item.id !== member.id));
    logActivity(`removed ${member.name} from the workspace`, "Team");
  }

  return (
    <ModuleShell
      title="Team"
      subtitle="Invite teammates, scope them to pages, and put them in exactly one permission group."
      walkthrough={{
        title: "Add your team",
        steps: [
          "Invite by email and pick a role — Owner, Admin, Member, or Viewer.",
          "Every teammate belongs to one group; the group decides what they can do and see.",
          "Page scoping limits which channels a teammate can open.",
          "The owner always sits outside groups and cannot be removed.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Teammates" value={String(team.length)} icon={Users} />
        <StatCard
          label="Active"
          value={String(team.filter((member) => member.status === "active").length)}
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="Pending invites"
          value={String(team.filter((member) => member.status === "invited").length)}
          tone="warning"
        />
        <StatCard label="Groups" value={String(groups.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[620px] text-left text-[13px]">
            <thead className="border-b border-border bg-surface/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Teammate</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Group</th>
                <th className="px-4 py-2.5">Pages</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-surface/50">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Pill tone={member.role === "Owner" ? "primary" : "neutral"}>
                      {member.role}
                    </Pill>
                  </td>
                  <td className="px-4 py-2.5">{member.group}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {member.pages.map((page) => (
                        <Pill key={page} tone="neutral">
                          {page}
                        </Pill>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Pill tone={member.status === "active" ? "success" : "warning"}>
                        {member.status}
                      </Pill>
                      {member.role !== "Owner" ? (
                        <button
                          type="button"
                          onClick={() => removeMember(member)}
                          aria-label={`Remove ${member.name}`}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-red-600"
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {team.length === 0 ? (
            <EmptyState icon={Users} title="No teammates" text="Invite your first teammate." />
          ) : null}
        </div>

        <SectionCard title="Invite" description="They join one group at a time.">
          <div className="space-y-2.5">
            <Field label="Email">
              <input
                value={invite.email}
                onChange={(event) => setInvite({ ...invite, email: event.target.value })}
                className={inputClass}
                placeholder="name@company.com"
                type="email"
              />
            </Field>
            <Field label="Role">
              <select
                value={invite.role}
                onChange={(event) =>
                  setInvite({ ...invite, role: event.target.value as Teammate["role"] })
                }
                className={inputClass}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Group">
              <select
                value={invite.group}
                onChange={(event) => setInvite({ ...invite, group: event.target.value })}
                className={inputClass}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              onClick={sendInvite}
              disabled={!invite.email.includes("@")}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <UserPlus className="size-4" />
              Send invite
            </button>
            <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Mail className="size-3.5" />
              Invite links expire after 7 days.
            </p>
          </div>
        </SectionCard>
      </div>
    </ModuleShell>
  );
}
