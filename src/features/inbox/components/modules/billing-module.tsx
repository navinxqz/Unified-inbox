"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Download,
  Receipt,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";

import {
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { initialBilling } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { BillingState } from "@/features/inbox/types";
import { cn, downloadCsv } from "@/lib/utils";

type TopUpMethod = "card" | "bkash" | "nagad";

type BillingProps = {
  logActivity: (action: string, subject: string) => void;
};

export function BillingModule({ logActivity }: BillingProps) {
  const [billing, setBilling] = useStoredState<BillingState>(
    MODULE_STORAGE_KEYS.billing,
    initialBilling,
  );
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [method, setMethod] = useState<TopUpMethod>("card");
  const [trxId, setTrxId] = useState("");

  const lowBalance = billing.credits < billing.lowBalanceThreshold;
  const manual = method !== "card";
  const canTopUp = !manual || trxId.trim().length >= 6;

  function topUp() {
    if (!canTopUp) return;
    const label =
      method === "card"
        ? "card •••• 4242"
        : `${method === "bkash" ? "bKash" : "Nagad"} · TrxID ${trxId.trim()}`;

    setBilling({
      ...billing,
      credits: billing.credits + amount,
      cardOnFile: method === "card" ? true : billing.cardOnFile,
      ledger: [
        {
          id: `lg-${Date.now()}`,
          at: "Just now",
          description: `Top-up · ${label}`,
          requestType: "top-up",
          credits: amount,
          balanceAfter: billing.credits + amount,
        },
        ...billing.ledger,
      ],
    });
    logActivity(`topped up ${amount.toLocaleString()} credits via ${label}`, "Billing");
    setTopUpOpen(false);
    setTrxId("");
  }

  return (
    <ModuleShell
      title="Billing"
      subtitle="Prepaid credits, an itemized ledger, and low-balance alerts — cards and mobile money both welcome."
      actions={
        <>
          <button
            type="button"
            onClick={() =>
              downloadCsv("billing-ledger.csv", [
                ["Time", "Description", "Request", "Credits", "Balance after"],
                ...billing.ledger.map((item) => [
                  item.at,
                  item.description,
                  item.requestType,
                  item.credits,
                  item.balanceAfter,
                ]),
              ])
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
          >
            <Download className="size-4" />
            Export ledger
          </button>
          <button
            type="button"
            onClick={() => setTopUpOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90"
          >
            <Wallet className="size-4" />
            Top up
          </button>
        </>
      }
      walkthrough={{
        title: "Understand billing",
        steps: [
          "Credits are prepaid — each AI reply, translation, and photo match draws from the balance.",
          "The itemized ledger shows every request, so the monthly bill is never a surprise.",
          "Set a low-balance threshold to get warned before replies start failing.",
          "Top up by card instantly, or by bKash/Nagad with a TrxID — both work.",
        ],
      }}
    >
      {lowBalance ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-semibold text-red-700">
          <AlertTriangle className="size-4 shrink-0" />
          Balance is below your {billing.lowBalanceThreshold.toLocaleString()}-credit
          warning threshold — top up to keep AI replies running.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Credit balance"
          value={billing.credits.toLocaleString()}
          sub={`plan · ${billing.plan}`}
          icon={Wallet}
          tone={lowBalance ? "danger" : "primary"}
        />
        <StatCard label="Plan" value={billing.plan} sub="monthly" icon={Receipt} />
        <StatCard
          label="Spent this month"
          value={billing.ledger
            .filter((item) => item.credits < 0)
            .reduce((sum, item) => sum + Math.abs(item.credits), 0)
            .toLocaleString()}
          sub="credits"
          icon={CreditCard}
        />
        <StatCard
          label="Card on file"
          value={billing.cardOnFile ? "Yes" : "No"}
          sub={billing.cardOnFile ? "•••• 4242" : "add one at top-up"}
          icon={CreditCard}
          tone={billing.cardOnFile ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <SectionCard title="Ledger" description="Itemized, newest first.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead className="border-b border-border text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Request</th>
                  <th className="py-2 pr-3">Credits</th>
                  <th className="py-2 pr-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {billing.ledger.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-3 text-[11px] whitespace-nowrap text-muted-foreground">
                      {item.at}
                    </td>
                    <td className="py-2 pr-3">
                      {item.description}
                      <span className="ml-1.5">
                        <Pill tone="neutral">{item.requestType}</Pill>
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-3 font-semibold",
                        item.credits > 0 ? "text-emerald-700" : "text-foreground",
                      )}
                    >
                      {item.credits > 0 ? "+" : ""}
                      {item.credits.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {item.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Low-balance warning">
            <Field label="Warn me below (credits)">
              <input
                type="number"
                value={billing.lowBalanceThreshold}
                onChange={(event) =>
                  setBilling({
                    ...billing,
                    lowBalanceThreshold: Number(event.target.value) || 0,
                  })
                }
                className={inputClass}
              />
            </Field>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              When the balance drops under this number, the sidebar and this page show a
              warning. Replies keep working until credits actually run out.
            </p>
          </SectionCard>

          <SectionCard title="Auto top-up" description="Never miss a customer because of credits.">
            <Toggle
              checked={billing.autoTopUp}
              onChange={(checked) => setBilling({ ...billing, autoTopUp: checked })}
              label="Auto top-up when balance is low"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {billing.autoTopUp
                ? `When the balance falls under ${billing.lowBalanceThreshold.toLocaleString()}, we add ${billing.autoTopUpAmount.toLocaleString()} credits using the card on file.`
                : "Turn this on to keep replies running without watching the balance."}
            </p>
          </SectionCard>
        </div>
      </div>

      {topUpOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Top up credits"
            className="relative w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close top-up"
              onClick={() => setTopUpOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-surface"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-bold">Top up credits</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Balance {billing.credits.toLocaleString()} credits · {billing.plan}
            </p>

            <p className="mt-4 mb-1.5 text-[11px] font-semibold text-muted-foreground">
              Amount
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[500, 1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  aria-pressed={amount === preset}
                  className={cn(
                    "rounded-lg border py-2 text-[13px] font-semibold transition-colors",
                    amount === preset
                      ? "border-primary bg-primary-soft text-primary-strong"
                      : "border-border text-ink-soft hover:bg-surface",
                  )}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>

            <p className="mt-4 mb-1.5 text-[11px] font-semibold text-muted-foreground">
              Method
            </p>
            <div className="space-y-1.5">
              {[
                { id: "card" as const, label: "Card (instant)", note: "Visa, Mastercard, Amex" },
                { id: "bkash" as const, label: "bKash", note: "Manual credit with TrxID" },
                { id: "nagad" as const, label: "Nagad", note: "Manual credit with TrxID" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMethod(option.id)}
                  aria-pressed={method === option.id}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                    method === option.id
                      ? "border-primary bg-primary-soft/50"
                      : "border-border hover:bg-surface/60",
                  )}
                >
                  {option.id === "card" ? (
                    <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold">{option.label}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {option.note}
                    </span>
                  </span>
                  {method === option.id ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))}
            </div>

            {manual ? (
              <div className="mt-3">
                <Field label="TrxID" hint="Send the money, then paste the transaction ID here.">
                  <input
                    value={trxId}
                    onChange={(event) => setTrxId(event.target.value)}
                    className={inputClass}
                    placeholder="9F2A7C1B"
                  />
                </Field>
              </div>
            ) : null}

            <button
              type="button"
              onClick={topUp}
              disabled={!canTopUp}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Wallet className="size-4" />
              Add {amount.toLocaleString()} credits
            </button>
            {manual ? (
              <p className="mt-2 inline-flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Mobile-money top-ups are credited once the TrxID is verified — usually in
                under a minute.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </ModuleShell>
  );
}
