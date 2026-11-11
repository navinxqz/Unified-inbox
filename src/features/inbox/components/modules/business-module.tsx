"use client";

import { useState } from "react";
import { Bot, Check, Globe, Megaphone, Save, Store } from "lucide-react";

import {
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SavedFlash,
  SectionCard,
} from "@/features/inbox/components/module-ui";
import { initialBusiness } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { BusinessProfile } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const paymentOptions = [
  "Cash on delivery",
  "bKash",
  "Nagad",
  "Card",
  "Rocket",
  "Bank transfer",
];

type BusinessProps = {
  logActivity: (action: string, subject: string) => void;
};

export function BusinessModule({ logActivity }: BusinessProps) {
  const [profile, setProfile] = useStoredState<BusinessProfile>(
    MODULE_STORAGE_KEYS.business,
    initialBusiness,
  );
  const [saved, setSaved] = useState(false);

  function save() {
    logActivity("updated business facts", "Business settings");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function togglePayment(method: string) {
    setProfile({
      ...profile,
      paymentMethods: profile.paymentMethods.includes(method)
        ? profile.paymentMethods.filter((item) => item !== method)
        : [...profile.paymentMethods, method],
    });
  }

  return (
    <ModuleShell
      title="Business"
      subtitle="Set these facts once — the AI, every channel, and the website widget all read from here."
      actions={
        <>
          <SavedFlash show={saved} />
          <button
            type="button"
            onClick={save}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90"
          >
            <Save className="size-4" />
            Save changes
          </button>
        </>
      }
      walkthrough={{
        title: "Fill in your business facts",
        steps: [
          "Write the address, hours, delivery policy, and return policy exactly as customers should hear them.",
          "Pick every payment method you actually accept — the AI will never offer one you didn't select.",
          "These facts feed Agent Desk, AI replies, broadcasts, and the website widget at once.",
          "Save once; every channel stays in sync.",
        ],
      }}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-xl border border-primary-border bg-primary-soft/50 px-3 py-2.5 text-[12px] text-primary-strong",
        )}
      >
        <Store className="size-4 shrink-0" />
        Set once, applies everywhere.
        <span className="inline-flex items-center gap-1">
          <Bot className="size-3.5" /> Agent Desk
        </span>
        <span className="inline-flex items-center gap-1">
          <Globe className="size-3.5" /> Website chat
        </span>
        <span className="inline-flex items-center gap-1">
          <Megaphone className="size-3.5" /> Broadcasts
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Identity">
          <div className="space-y-3">
            <Field label="Business name">
              <input
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <input
                value={profile.category}
                onChange={(event) => setProfile({ ...profile, category: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Address">
              <input
                value={profile.address}
                onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Opening hours">
              <input
                value={profile.hours}
                onChange={(event) => setProfile({ ...profile, hours: event.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Policies the AI quotes" description="Keep these literal — replies copy them.">
          <div className="space-y-3">
            <Field label="Delivery policy">
              <textarea
                value={profile.deliveryPolicy}
                onChange={(event) =>
                  setProfile({ ...profile, deliveryPolicy: event.target.value })
                }
                rows={4}
                className={inputClass}
              />
            </Field>
            <Field label="Return & refund policy">
              <textarea
                value={profile.returnPolicy}
                onChange={(event) =>
                  setProfile({ ...profile, returnPolicy: event.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </Field>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
                Payment methods accepted
              </p>
              <div className="flex flex-wrap gap-1.5">
                {paymentOptions.map((method) => {
                  const active = profile.paymentMethods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => togglePayment(method)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary-soft text-primary-strong"
                          : "border-border text-muted-foreground hover:bg-surface",
                      )}
                    >
                      {active ? <Check className="size-3" /> : null}
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="What the AI will say" description="A live render of your current facts.">
        <div className="space-y-2 text-[13px] leading-relaxed">
          <p>
            <b>{profile.name}</b> · {profile.category}
          </p>
          <p className="text-muted-foreground">{profile.address}</p>
          <p className="text-muted-foreground">{profile.hours}</p>
          <p className="rounded-lg bg-surface p-2.5">{profile.deliveryPolicy}</p>
          <p className="rounded-lg bg-surface p-2.5">{profile.returnPolicy}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.paymentMethods.map((method) => (
              <Pill key={method} tone="neutral">
                {method}
              </Pill>
            ))}
          </div>
        </div>
      </SectionCard>
    </ModuleShell>
  );
}
