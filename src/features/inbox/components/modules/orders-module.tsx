"use client";

import { useState } from "react";
import {
  Bike,
  Check,
  Download,
  Plus,
  Printer,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  ModuleTabs,
  Pill,
  SectionCard,
  StatCard,
} from "@/features/inbox/components/module-ui";
import {
  initialCoupons,
  initialOrders,
  orderStageLabels,
} from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type {
  DiscountCoupon,
  Order,
  OrderStage,
} from "@/features/inbox/types";
import { cn, downloadCsv } from "@/lib/utils";

const stages: OrderStage[] = [
  "new",
  "confirmed",
  "packed",
  "courier",
  "delivered",
  "returned",
  "cancelled",
];

type Tab = "pipeline" | "chase" | "courier" | "discounts" | "report";

type OrdersProps = {
  logActivity: (action: string, subject: string) => void;
};

export function OrdersModule({ logActivity }: OrdersProps) {
  const [orders, setOrders] = useStoredState<Order[]>(
    MODULE_STORAGE_KEYS.orders,
    initialOrders,
  );
  const [coupons, setCoupons] = useStoredState<DiscountCoupon[]>(
    MODULE_STORAGE_KEYS.coupons,
    initialCoupons,
  );
  const [tab, setTab] = useState<Tab>("pipeline");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OrderStage | null>(null);
  const [newCoupon, setNewCoupon] = useState({ code: "", percent: "" });

  function moveOrder(orderId: string, stage: OrderStage) {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.stage === stage) return;

    setOrders(
      orders.map((item) =>
        item.id === orderId
          ? {
              ...item,
              stage,
              chase: stage === "packed" ? item.chase : false,
              courier:
                stage === "courier"
                  ? item.courier ?? "Pathao"
                  : item.courier,
            }
          : item,
      ),
    );
    logActivity(
      `moved order ${order.code} to ${orderStageLabels[stage]}`,
      order.code,
    );
  }

  function sendChaseNotice(order: Order) {
    if (order.chaseNoticeAt) return;
    setOrders(
      orders.map((item) =>
        item.id === order.id ? { ...item, chaseNoticeAt: "Just now" } : item,
      ),
    );
    logActivity(`sent one chase notice for ${order.code}`, order.code);
  }

  function addCoupon() {
    const code = newCoupon.code.trim().toUpperCase();
    const percent = Number(newCoupon.percent);
    if (!code || !percent) return;
    setCoupons([
      {
        id: `cp-${Date.now()}`,
        code,
        percent,
        expiresAt: "2026-12-31",
        uses: 0,
        active: true,
      },
      ...coupons,
    ]);
    logActivity(`created discount ${code} (${percent}% off)`, "Orders · Discounts");
    setNewCoupon({ code: "", percent: "" });
  }

  const codHeld = orders
    .filter((order) => order.stage === "courier" && order.cod)
    .reduce((sum, order) => sum + order.total, 0);
  const chaseOrders = orders.filter(
    (order) => order.stage === "packed" && order.chase,
  );
  const courierOrders = orders.filter((order) => order.stage === "courier");
  const revenue = orders
    .filter((order) => order.stage === "delivered")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <ModuleShell
      title="Orders"
      subtitle="Pipeline, courier handover, and COD tracking — cancel, never delete."
      actions={
        <button
          type="button"
          onClick={() =>
            downloadCsv("orders.csv", [
              ["Code", "Customer", "Phone", "Items", "Total", "COD", "Stage", "Created"],
              ...orders.map((order) => [
                order.code,
                order.customer,
                order.phone,
                order.items,
                order.total,
                order.cod ? "Yes" : "No",
                orderStageLabels[order.stage],
                order.createdAt,
              ]),
            ])
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
        >
          <Download className="size-4" />
          Export
        </button>
      }
      walkthrough={{
        title: "Run orders end to end",
        steps: [
          "Orders land in New from every channel — drag them across the pipeline as they move.",
          "To chase shows packed orders where the customer still needs to confirm something.",
          "Courier handover lists every parcel going out with the cash the rider will collect.",
          "Cancelled and returned orders stay in the pipeline; nothing is ever deleted.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Open orders"
          value={String(
            orders.filter(
              (order) => !["delivered", "returned", "cancelled"].includes(order.stage),
            ).length,
          )}
          icon={ShoppingBag}
        />
        <StatCard label="In courier" value={String(courierOrders.length)} icon={Truck} />
        <StatCard
          label="COD cash held"
          value={codHeld.toLocaleString()}
          sub="collect on delivery"
          icon={Bike}
          tone="warning"
        />
        <StatCard
          label="Delivered revenue"
          value={revenue.toLocaleString()}
          icon={Check}
          tone="success"
        />
      </div>

      <ModuleTabs
        tabs={[
          { id: "pipeline", label: "Pipeline", count: orders.length },
          { id: "chase", label: "To chase", count: chaseOrders.length },
          { id: "courier", label: "Courier handover", count: courierOrders.length },
          { id: "discounts", label: "Discounts", count: coupons.length },
          { id: "report", label: "Report" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "pipeline" ? (
        <SectionCard title="Order pipeline" description="Drag a card to move it.">
          <div className="scrollbar-thin -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
            {stages.map((stage) => {
              const items = orders.filter((order) => order.stage === stage);
              const isDragOver = dragOverStage === stage;
              return (
                <div
                  key={stage}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStage(stage);
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedId) moveOrder(draggedId, stage);
                    setDraggedId(null);
                    setDragOverStage(null);
                  }}
                  className={cn(
                    "flex w-[214px] shrink-0 flex-col rounded-xl border bg-surface/50 p-2",
                    isDragOver ? "border-primary bg-primary-soft/50" : "border-border-subtle",
                  )}
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <p className="text-xs font-bold">{orderStageLabels[stage]}</p>
                    <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-2 py-4 text-center text-[11px] text-muted-foreground">
                        Drop here
                      </p>
                    ) : (
                      items.map((order) => (
                        <article
                          key={order.id}
                          draggable
                          onDragStart={() => setDraggedId(order.id)}
                          onDragEnd={() => setDraggedId(null)}
                          className="cursor-grab rounded-lg border border-border bg-background p-2.5 active:cursor-grabbing"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-mono text-[11px] font-bold text-primary-strong">
                              {order.code}
                            </p>
                            {order.cod ? <Pill tone="warning">COD</Pill> : null}
                          </div>
                          <p className="mt-1 text-[13px] font-semibold">{order.customer}</p>
                          <p className="text-[11px] text-muted-foreground">{order.items}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs font-bold">
                              {order.total.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {order.createdAt}
                            </span>
                          </div>
                          {order.courier ? (
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {order.courier}
                            </p>
                          ) : null}
                        </article>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : null}

      {tab === "chase" ? (
        <SectionCard
          title="To chase"
          description="Packed orders that still need something from the customer. One notice per 20 hours."
        >
          {chaseOrders.length === 0 ? (
            <EmptyState
              icon={Check}
              title="Nothing to chase"
              text="Every packed order has what it needs to ship."
            />
          ) : (
            <div className="divide-y divide-border-subtle">
              {chaseOrders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">
                      <span className="font-mono text-primary-strong">{order.code}</span> ·{" "}
                      {order.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items} · {order.phone}
                    </p>
                  </div>
                  <Pill tone={order.chaseNoticeAt ? "neutral" : "warning"}>
                    {order.chaseNoticeAt
                      ? `Notice sent ${order.chaseNoticeAt}`
                      : "No notice sent"}
                  </Pill>
                  <button
                    type="button"
                    onClick={() => sendChaseNotice(order)}
                    disabled={Boolean(order.chaseNoticeAt)}
                    className="h-8 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
                  >
                    Send notice
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === "courier" ? (
        <div className="space-y-4">
          <SectionCard
            title="Courier handover sheet"
            description="Print or export this before the rider arrives."
            action={
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
              >
                <Printer className="size-3.5" />
                Print sheet
              </button>
            }
          >
            {courierOrders.length === 0 ? (
              <EmptyState icon={Truck} title="No parcels in transit" text="Move an order to Handed to courier first." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[13px]">
                  <thead className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <tr>
                      <th className="py-1.5 pr-3">Order</th>
                      <th className="py-1.5 pr-3">Customer</th>
                      <th className="py-1.5 pr-3">Courier</th>
                      <th className="py-1.5 pr-3">Collect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {courierOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-2 pr-3 font-mono text-xs font-bold">{order.code}</td>
                        <td className="py-2 pr-3">
                          {order.customer}
                          <span className="block text-[11px] text-muted-foreground">{order.phone}</span>
                        </td>
                        <td className="py-2 pr-3">{order.courier}</td>
                        <td className="py-2 pr-3 font-semibold">
                          {order.cod ? order.total.toLocaleString() : "Prepaid"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-[11px] font-semibold text-warning">
              Total cash to collect: {codHeld.toLocaleString()}
            </p>
          </SectionCard>
        </div>
      ) : null}

      {tab === "discounts" ? (
        <SectionCard
          title="Discounts"
          description="The only codes the AI is allowed to offer."
        >
          <div className="flex flex-wrap items-end gap-2 pb-3">
            <Field label="Code" className="w-32">
              <input
                value={newCoupon.code}
                onChange={(event) => setNewCoupon({ ...newCoupon, code: event.target.value })}
                className={inputClass}
                placeholder="EID25"
              />
            </Field>
            <Field label="% off" className="w-24">
              <input
                value={newCoupon.percent}
                onChange={(event) => setNewCoupon({ ...newCoupon, percent: event.target.value })}
                className={inputClass}
                placeholder="25"
                inputMode="numeric"
              />
            </Field>
            <button
              type="button"
              onClick={addCoupon}
              disabled={!newCoupon.code.trim() || !newCoupon.percent.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="size-4" />
              Add code
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center gap-3 py-2.5">
                <Tag className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-bold">{coupon.code}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Expires {coupon.expiresAt} · used {coupon.uses} times
                  </p>
                </div>
                <Pill tone={coupon.active ? "success" : "neutral"}>
                  {coupon.active ? `${coupon.percent}% off` : "Expired"}
                </Pill>
                <button
                  type="button"
                  onClick={() =>
                    setCoupons(
                      coupons.map((item) =>
                        item.id === coupon.id ? { ...item, active: !item.active } : item,
                      ),
                    )
                  }
                  className="h-8 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                >
                  {coupon.active ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === "report" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Status breakdown">
            <div className="space-y-2">
              {stages.map((stage) => {
                const count = orders.filter((order) => order.stage === stage).length;
                const percent = Math.round(
                  (count / Math.max(1, orders.length)) * 100,
                );
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{orderStageLabels[stage]}</span>
                      <span className="text-muted-foreground">
                        {count} · {percent}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard title="Commercials">
            <dl className="space-y-2 text-[13px]">
              {[
                ["Orders in pipeline", String(orders.length)],
                [
                  "Delivered revenue",
                  orders
                    .filter((order) => order.stage === "delivered")
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString(),
                ],
                [
                  "COD outstanding",
                  orders
                    .filter((order) => order.stage === "courier" && order.cod)
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString(),
                ],
                [
                  "Returned value",
                  orders
                    .filter((order) => order.stage === "returned")
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString(),
                ],
                ["Cancelled", String(orders.filter((order) => order.stage === "cancelled").length)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-border-subtle pb-1.5 last:border-0">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-bold">{value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() =>
                downloadCsv("orders-report.csv", [
                  ["Metric", "Value"],
                  ["Orders", orders.length],
                  ["Delivered revenue", revenue],
                  ["COD outstanding", codHeld],
                ])
              }
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
            >
              <Download className="size-3.5" />
              Download report
            </button>
          </SectionCard>
        </div>
      ) : null}

      {orders.length === 0 && tab === "pipeline" ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders loaded"
          text="Orders created from any channel will appear in the pipeline."
        />
      ) : null}
    </ModuleShell>
  );
}
