"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

function ContactForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product_id");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    product_id: productId || "",
    source_page: "/contact",
    size: "",
    additional_notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/api/inquiries", formData);
      setSuccess(true);
      setFormData({ name: "", phone: "", email: "", message: "", product_id: "", source_page: "/contact", size: "", additional_notes: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-1 block">Avirat Concierge</span>
        <h1 className="text-4xl font-serif text-charcoal mb-3">Get in Touch</h1>
        <p className="text-base text-charcoal/70 max-w-md mx-auto">
          Have a question about a piece or looking for custom bespoke jewelry? We&apos;d love to help.
        </p>
      </div>

      {success ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-charcoal mb-2">Inquiry Received</h2>
          <p className="text-charcoal/70 max-w-sm mx-auto">
            Thank you for reaching out. Our jewelry specialist will get back to you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-100" noValidate>
          {error && (
            <div id="form-error" role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1.5">
                Name <span className="text-dusty-rose" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                aria-required="true"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-charcoal"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1.5">
                Phone <span className="text-dusty-rose" aria-hidden="true">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                aria-required="true"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-charcoal"
                placeholder="Phone number (e.g. +91 98765 43210)"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-charcoal"
                placeholder="your.email@example.com"
              />
            </div>

            {productId && (
              <div>
                <label htmlFor="product_id" className="block text-sm font-medium text-charcoal mb-1.5">
                  Selected Product Ref
                </label>
                <input
                  type="text"
                  id="product_id"
                  value={formData.product_id}
                  readOnly
                  className="w-full border border-charcoal/20 rounded-lg px-4 py-2.5 bg-[#FAF8F5] text-charcoal/70 font-mono text-sm"
                />
              </div>
            )}

            {productId && (
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-charcoal mb-1.5">
                  Size Preference
                </label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full border border-charcoal/20 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-charcoal"
                >
                  <option value="">Select size (optional)</option>
                  <option value="ring-5">Ring Size 5</option>
                  <option value="ring-6">Ring Size 6</option>
                  <option value="ring-7">Ring Size 7</option>
                  <option value="ring-8">Ring Size 8</option>
                  <option value="ring-9">Ring Size 9</option>
                  <option value="ring-10">Ring Size 10</option>
                  <option value="ring-11">Ring Size 11</option>
                  <option value="ring-12">Ring Size 12</option>
                  <option value="bangle-2.2">Bangle 2.2&quot;</option>
                  <option value="bangle-2.4">Bangle 2.4&quot;</option>
                  <option value="bangle-2.6">Bangle 2.6&quot;</option>
                  <option value="bangle-2.8">Bangle 2.8&quot;</option>
                  <option value="chain-16">Chain 16&quot;</option>
                  <option value="chain-18">Chain 18&quot;</option>
                  <option value="chain-20">Chain 20&quot;</option>
                  <option value="chain-22">Chain 22&quot;</option>
                  <option value="chain-24">Chain 24&quot;</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-1.5">
                Message / Inquiry Details
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none text-charcoal"
                placeholder="Tell us about the design, occasion, or customization you have in mind..."
              />
            </div>

            <div>
              <label htmlFor="additional_notes" className="block text-sm font-medium text-charcoal mb-1.5">
                Additional Notes
              </label>
              <textarea
                id="additional_notes"
                rows={2}
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none text-charcoal"
                placeholder="Preferred call time, metal preference, budget..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-white py-3.5 px-6 rounded-lg font-medium hover:opacity-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Sending Inquiry..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-16">
      <Suspense fallback={
        <div className="max-w-2xl mx-auto px-4 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gold"></div>
        </div>
      }>
        <ContactForm />
      </Suspense>
    </div>
  );
}

