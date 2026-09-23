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
      setFormData({ name: "", phone: "", message: "", product_id: "", source_page: "/contact", size: "", additional_notes: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">Get in Touch</h1>
        <p className="text-sm text-charcoal/70 max-w-md mx-auto">
          Have a question about a piece or looking for custom bespoke jewelry? We&apos;d love to help.
        </p>
      </div>

      {success ? (
        <div className="bg-white rounded-sm shadow-md p-6 text-center border border-gray-100">
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-serif text-charcoal mb-2">Inquiry Received</h2>
          <p className="text-charcoal/70 max-w-sm mx-auto mb-4 text-sm">
            Thank you for reaching out. Our jewelry specialist will get back to you shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-5 py-2.5 bg-gold text-white font-medium hover:opacity-95 transition-all shadow-md border-b-4 border-dusty-rose text-sm"
          >
            Send Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-sm shadow-md p-5 border border-gray-100" noValidate>
          {error && (
            <div id="form-error" role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1">
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
                className="w-full border border-charcoal/20 bg-white rounded-sm px-3 py-2 focus:outline-none focus:border-gold transition-colors text-charcoal text-sm"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1">
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
                className="w-full border border-charcoal/20 bg-white rounded-sm px-3 py-2 focus:outline-none focus:border-gold transition-colors text-charcoal text-sm"
                placeholder="Your phone number"
              />
            </div>

            {productId && (
              <div>
                <label htmlFor="product_id" className="block text-sm font-medium text-charcoal mb-1">
                  Selected Product Ref
                </label>
                <input
                  type="text"
                  id="product_id"
                  value={formData.product_id}
                  readOnly
                  className="w-full border border-charcoal/20 rounded-sm px-3 py-2 bg-[#FAF8F5] text-charcoal/70 font-mono text-xs"
                />
              </div>
            )}

            {productId && (
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-charcoal mb-1">
                  Size Preference
                </label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full border border-charcoal/20 bg-white rounded-sm px-3 py-2.5 focus:outline-none focus:border-gold transition-colors text-charcoal text-base"
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
              <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-1">
                Message <span className="text-dusty-rose" aria-hidden="true">*</span>
              </label>
              <textarea
                id="message"
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-sm px-3 py-2 focus:outline-none focus:border-gold transition-colors resize-none text-charcoal text-sm"
                placeholder="Tell us about the design, occasion, or customization you have in mind..."
              />
            </div>

            <div>
              <label htmlFor="additional_notes" className="block text-sm font-medium text-charcoal mb-1">
                Additional Notes
              </label>
              <textarea
                id="additional_notes"
                rows={2}
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                className="w-full border border-charcoal/20 bg-white rounded-sm px-3 py-2 focus:outline-none focus:border-gold transition-colors resize-none text-charcoal text-sm"
                placeholder="Metal preference, budget, visit time..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] bg-gold text-white py-3 px-6 font-medium hover:opacity-95 transition-all shadow-md border-b-4 border-dusty-rose disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
    <div className="min-h-screen bg-[#FAF8F5] pt-20 sm:pt-28 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-sm shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-serif text-charcoal mb-4">Visit Our Store</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-charcoal mb-1">Address</p>
                  <p className="text-charcoal/70 text-sm">
                    Shayona Green, Gota<br />
                    Ahmedabad, Gujarat 382481
                  </p>
                </div>
                <div>
                  <p className="font-medium text-charcoal mb-1">Business Hours</p>
                  <p className="text-charcoal/70 text-sm">
                    Monday - Saturday: 10:00 AM - 8:00 PM<br />
                    Sunday: 11:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gold"></div>
              </div>
            }>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

