"use client";

import { useState } from "react";
import {
  Camera,
  Check,
  FileSpreadsheet,
  Package,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  EmptyState,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { initialProducts } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { Product } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type CsvCandidate = {
  name: string;
  price: number;
  stock: number;
  action: "add" | "update";
  existingId?: string;
};

const csvPreview: CsvCandidate[] = [
  { name: "Trail Runner", price: 4100, stock: 12, action: "update", existingId: "p-2" },
  { name: "Merino Base Layer", price: 2850, stock: 18, action: "add" },
  { name: "Packable Rain Shell", price: 4600, stock: 7, action: "add" },
  { name: "Ceramic Mug", price: 450, stock: 80, action: "update", existingId: "p-5" },
];

type ProductsProps = {
  logActivity: (action: string, subject: string) => void;
};

export function ProductsModule({ logActivity }: ProductsProps) {
  const [products, setProducts] = useStoredState<Product[]>(
    MODULE_STORAGE_KEYS.products,
    initialProducts,
  );
  const [importOpen, setImportOpen] = useState(false);

  const active = products.filter((product) => !product.deleted);
  const deleted = products.filter((product) => product.deleted);

  function togglePhotoMatch(product: Product) {
    setProducts(
      products.map((item) =>
        item.id === product.id ? { ...item, photoMatch: !item.photoMatch } : item,
      ),
    );
  }

  function softDelete(product: Product) {
    setProducts(
      products.map((item) =>
        item.id === product.id ? { ...item, deleted: true } : item,
      ),
    );
    logActivity(`removed ${product.name} from the catalog (recoverable)`, "Products");
  }

  function restore(product: Product) {
    setProducts(
      products.map((item) =>
        item.id === product.id ? { ...item, deleted: false } : item,
      ),
    );
    logActivity(`restored ${product.name} to the catalog`, "Products");
  }

  function approveImport() {
    setProducts((current) => {
      const next = [...current];
      for (const candidate of csvPreview) {
        if (candidate.action === "update" && candidate.existingId) {
          const index = next.findIndex((item) => item.id === candidate.existingId);
          if (index >= 0) {
            next[index] = {
              ...next[index],
              price: candidate.price,
              stock: candidate.stock,
              source: "csv",
              edited: true,
            };
          }
        } else {
          next.unshift({
            id: `p-csv-${Date.now()}-${candidate.name.slice(0, 3)}`,
            name: candidate.name,
            price: candidate.price,
            stock: candidate.stock,
            photoMatch: false,
            source: "csv",
          });
        }
      }
      return next;
    });
    logActivity(`imported catalog CSV — ${csvPreview.length} rows approved`, "Products");
    setImportOpen(false);
  }

  return (
    <ModuleShell
      title="Products"
      subtitle="The catalog the AI is allowed to quote — prices, stock, and photo-match mappings."
      actions={
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90"
        >
          <Upload className="size-4" />
          Import CSV
        </button>
      }
      walkthrough={{
        title: "Keep the catalog accurate",
        steps: [
          "Every price the AI quotes comes from this table — nothing else.",
          "CSV imports show a preview first; approve adds, reject leaves everything untouched.",
          "Edited rows keep a marker so you can tell catalog-synced data from hand edits.",
          "Removing a product is recoverable — restore it from the removed list.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Products" value={String(active.length)} icon={Package} />
        <StatCard
          label="Photo match on"
          value={String(active.filter((product) => product.photoMatch).length)}
          icon={Camera}
          tone="success"
        />
        <StatCard
          label="Out of stock"
          value={String(active.filter((product) => product.stock === 0).length)}
          tone="warning"
        />
        <StatCard
          label="From CSV"
          value={String(active.filter((product) => product.source === "csv").length)}
          icon={FileSpreadsheet}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="border-b border-border bg-surface/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Stock</th>
              <th className="px-4 py-2.5">Source</th>
              <th className="px-4 py-2.5">Photo match</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {active.map((product) => (
              <tr key={product.id} className="hover:bg-surface/50">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
                      <Package className="size-3.5" />
                    </span>
                    <span className="font-semibold">{product.name}</span>
                    {product.edited ? <Pill tone="warning">edited</Pill> : null}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-semibold">{product.price.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <span className={cn(product.stock === 0 && "font-semibold text-red-600")}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <Pill tone={product.source === "csv" ? "info" : "neutral"}>
                    {product.source === "csv" ? "CSV sync" : "Panel"}
                  </Pill>
                </td>
                <td className="px-4 py-2.5">
                  <Toggle
                    checked={product.photoMatch}
                    onChange={() => togglePhotoMatch(product)}
                    label={`Photo match for ${product.name}`}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => softDelete(product)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {active.length === 0 ? (
          <EmptyState icon={Package} title="No products" text="Import a CSV or add your first product." />
        ) : null}
      </div>

      {deleted.length > 0 ? (
        <SectionCard
          title="Removed products"
          description="Recoverable — nothing is hard-deleted."
        >
          <div className="divide-y divide-border-subtle">
            {deleted.map((product) => (
              <div key={product.id} className="flex items-center gap-3 py-2">
                <span className="min-w-0 flex-1 text-[13px] text-muted-foreground line-through">
                  {product.name}
                </span>
                <button
                  type="button"
                  onClick={() => restore(product)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                >
                  <RotateCcw className="size-3.5" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {importOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Import catalog CSV"
            className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close import"
              onClick={() => setImportOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-surface"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-bold">Preview import</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {csvPreview.length} rows parsed from catalog-2026.csv. Nothing changes until you approve.
            </p>
            <div className="mt-4 divide-y divide-border-subtle rounded-lg border border-border">
              {csvPreview.map((candidate) => (
                <div key={candidate.name} className="flex items-center gap-3 px-3 py-2">
                  <Pill tone={candidate.action === "add" ? "success" : "info"}>
                    {candidate.action}
                  </Pill>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                    {candidate.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {candidate.price.toLocaleString()} · {candidate.stock} pcs
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={approveImport}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-white hover:bg-primary/90"
              >
                <Check className="size-4" />
                Approve import
              </button>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="h-9 rounded-lg border border-border px-3.5 text-[13px] font-semibold text-ink-soft hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModuleShell>
  );
}
