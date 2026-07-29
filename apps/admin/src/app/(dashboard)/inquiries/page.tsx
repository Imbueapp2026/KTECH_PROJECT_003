"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { InquiryStatus, InquiryJoined, Product } from "@/lib/data/types";

const STATUS_TONE: Record<InquiryStatus, "new" | "info" | "neutral"> = {
  new: "new",
  contacted: "info",
  resolved: "neutral",
};

const NEXT_STATUS: Record<InquiryStatus, InquiryStatus | null> = {
  new: "contacted",
  contacted: "resolved",
  resolved: null,
};

const NEXT_LABEL: Record<InquiryStatus, string> = {
  new: "Mark contacted",
  contacted: "Resolve",
  resolved: "",
};

export default function InquiriesPage() {
  const [items, setItems] = useState<InquiryJoined[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ data: InquiryJoined[] }>("/api/admin/inquiries");
        if (!cancelled) setItems(res.data);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function transition(row: InquiryJoined) {
    const next = NEXT_STATUS[row.status];
    if (!next) return;
    setBusyId(row.id);
    try {
      await api.patch(`/api/admin/inquiries/${row.id}`, { status: next });
      setItems((prev) =>
        prev ? prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)) : prev,
      );
      push(`Inquiry ${next}.`, "success");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Could not update inquiry.", "danger");
    } finally {
      setBusyId(null);
    }
  }

  const newCount = items?.filter((i) => i.status === "new").length ?? 0;
  const contactedCount = items?.filter((i) => i.status === "contacted").length ?? 0;

  return (
    <div className="p-5 md:p-8 max-w-6xl flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4 flex-wrap border-b border-[var(--color-tertiary-soft)] pb-5">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--color-quaternary)]">
            Conversations
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
            Inquiry
          </h1>
        </div>
        {items && (
          <div className="flex items-center gap-2">
            <Badge tone="new">{newCount} new</Badge>
            <Badge tone="info">{contactedCount} contacted</Badge>
            <Badge tone="neutral">{items.length - newCount - contactedCount} resolved</Badge>
          </div>
        )}
      </header>

      {error && (
        <p
          className="text-sm text-[var(--color-error)] bg-[var(--color-error-soft)] border border-[var(--color-error)]/30 rounded-[var(--radius-md)] px-4 py-3"
          role="alert"
        >
          {error}
        </p>
      )}

      {items === null ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[var(--color-primary)] border border-dashed border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] py-16 text-center">
          <p className="text-sm text-[var(--color-tertiary)]">No inquiries yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((row) => {
            const isNew = row.status === "new";
            const next = NEXT_STATUS[row.status];
            return (
              <li
                key={row.id}
                className={`bg-[var(--color-primary)] border rounded-[var(--radius-md)] shadow-[var(--shadow-card)] p-5 flex flex-col gap-3 transition-colors ${
                  isNew
                    ? "border-[var(--color-secondary)] border-l-[3px]"
                    : "border-[var(--color-tertiary-soft)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        {row.name}
                      </p>
                      <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-tertiary)]">
                      {row.email} · {row.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {next && (
                      <Button
                        size="sm"
                        variant={row.status === "contacted" ? "danger" : "primary"}
                        onClick={() => transition(row)}
                        disabled={busyId === row.id}
                      >
                        {NEXT_LABEL[row.status]}
                      </Button>
                    )}
                  </div>
                </div>
                {row.message && (
                  <p className="text-sm text-[var(--color-ink-soft)] whitespace-pre-wrap leading-relaxed bg-[var(--color-surface-muted)] rounded-[var(--radius-sm)] p-3 border border-[var(--color-tertiary-soft)]">
                    {row.message}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-[var(--color-tertiary)] pt-1 border-t border-[var(--color-tertiary-soft)]">
                  <span>
                    {row.product ? (
                      <>
                        <span className="text-[var(--color-quaternary)] font-medium">Re:</span>{" "}
                        {row.product.name}
                      </>
                    ) : (
                      "General inquiry"
                    )}
                  </span>
                  <span>{new Date(row.created_at).toLocaleString()}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}