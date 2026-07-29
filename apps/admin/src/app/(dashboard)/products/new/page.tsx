"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ImageUploader } from "@/components/products/ImageUploader";
import { calculateGoldPrice, PURITY_OPTIONS, MAKING_CHARGE_TYPES } from "@/lib/pricing";
import type { Category, Offer } from "@/lib/data/types";

export default function NewProductPage() {
  const router = useRouter();
  const { push } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [goldPriceLoading, setGoldPriceLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    hallmark_certified: false,
    availability: "",
    offer_id: "",
    status: "draft" as "draft" | "published" | "archived",
    // Gold pricing fields
    purity_carats: 22 as 24 | 22 | 18 | 14 | 9,
    weight_grams: "",
    making_charge: "",
    making_charge_type: "percent" as "percent" | "flat",
    certifications: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const calculateEstimatedPrice = (): number => {
    if (!goldPrice || !formData.weight_grams || !formData.making_charge) return 0;
    
    return calculateGoldPrice({
      goldPricePerGram: goldPrice,
      purityCarats: formData.purity_carats,
      weightGrams: parseFloat(formData.weight_grams),
      makingCharge: parseFloat(formData.making_charge),
      makingChargeType: formData.making_charge_type,
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, offerRes, goldRes] = await Promise.all([
          api.get<{ data: Category[] }>("/api/admin/categories"),
          api.get<{ data: Offer[] }>("/api/admin/offers"),
          api.get<{ price_per_gram: number | null }>("/api/admin/gold-price").catch(() => ({ price_per_gram: null })),
        ]);
        
        setCategories(catRes.data);
        setOffers(offerRes.data);
        setGoldPrice(goldRes.price_per_gram);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
        setGoldPriceLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        name: formData.name,
        category_id: formData.category_id || null,
        description: formData.description,
        hallmark_certified: formData.hallmark_certified,
        availability: formData.availability,
        offer_id: formData.offer_id || null,
        status: formData.status,
        image_urls: imageUrls,
        // Gold pricing fields
        purity_carats: formData.purity_carats,
        weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
        making_charge_percent: formData.making_charge_type === 'percent' ? (formData.making_charge ? parseFloat(formData.making_charge) : null) : null,
        making_charge_flat: formData.making_charge_type === 'flat' ? (formData.making_charge ? parseFloat(formData.making_charge) : null) : null,
        making_charge_type: formData.making_charge_type,
        certifications: formData.certifications || null,
        gold_price_used: goldPrice,
      };

      const res = await api.post<{ data: { id: string } }>("/api/admin/products", payload);
      push("Product created successfully.", "success");
      router.push(`/products/${res.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create product.");
      push(err instanceof ApiError ? err.message : "Failed to create product.", "danger");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-5 md:p-8 max-w-4xl flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/products" className="text-sm text-[var(--color-tertiary)] hover:text-[var(--color-ink)]">
            ← Back to Products
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
            Add New Product
          </h1>
        </div>
      </header>

      {error && (
        <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-soft)] border border-[var(--color-error)]/30 rounded-[var(--radius-md)] px-4 py-3" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
            Category
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hallmark"
            checked={formData.hallmark_certified}
            onChange={(e) => setFormData({ ...formData, hallmark_certified: e.target.checked })}
            className="w-4 h-4 rounded border-[var(--color-tertiary-soft)] text-[var(--color-quaternary)] focus:ring-[var(--color-quaternary)]"
          />
          <label htmlFor="hallmark" className="text-sm text-[var(--color-ink)]">
            Hallmark Certified
          </label>
        </div>

        <Input
          label="Availability"
          value={formData.availability}
          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          placeholder="e.g., In Stock, Made to Order"
        />

        {/* Gold Pricing Section */}
        <div className="bg-[var(--color-quaternary-soft)]/40 border border-[var(--color-quaternary)]/20 rounded-[var(--radius-md)] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[var(--color-quaternary)]">
              Gold Pricing
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
                Purity <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                value={formData.purity_carats}
                onChange={(e) => setFormData({ ...formData, purity_carats: parseInt(e.target.value) as 24 | 22 | 18 | 14 | 9 })}
                className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
                required
              >
                {PURITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
                Weight (grams) <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight_grams}
                onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
                placeholder="10.0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
                Making Charge Type
              </label>
              <select
                value={formData.making_charge_type}
                onChange={(e) => setFormData({ ...formData, making_charge_type: e.target.value as "percent" | "flat" })}
                className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
              >
                {MAKING_CHARGE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
                Making Charge {formData.making_charge_type === 'percent' ? '(%)' : '(₹)'} <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.making_charge}
                onChange={(e) => setFormData({ ...formData, making_charge: e.target.value })}
                className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
                placeholder={formData.making_charge_type === 'percent' ? '10' : '500'}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
              Certifications
            </label>
            <input
              type="text"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
              placeholder="e.g., BIS Hallmark, IGI, GIA"
            />
          </div>

          {/* Live Price Preview */}
          <div className="mt-4 pt-4 border-t border-[var(--color-quaternary)]/20">
            {goldPriceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : goldPrice ? (
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[var(--color-quaternary)] mb-1">
                  Estimated Price
                </p>
                <p className="text-2xl font-semibold text-[var(--color-ink)]">
                  ₹{calculateEstimatedPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[var(--color-tertiary)] mt-1">
                  Based on current gold price: ₹{goldPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/g
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-error)]">
                Gold price unavailable — cannot calculate
              </p>
            )}
          </div>
        </div>


        <div>
          <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
            Offer
          </label>
          <select
            value={formData.offer_id}
            onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
            className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
          >
            <option value="">No offer</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-ink-soft)] mb-1.5 block">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" | "archived" })}
            className="h-10 px-3 bg-[var(--color-primary)] border border-[var(--color-tertiary-soft)] rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] focus:border-[var(--color-quaternary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-quaternary)]/20"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <ImageUploader
          urls={imageUrls}
          onChange={setImageUrls}
          disabled={saving}
        />

        <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-tertiary-soft)]">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Product"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
