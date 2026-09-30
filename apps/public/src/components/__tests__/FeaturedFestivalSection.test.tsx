import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, cleanup } from "@testing-library/react";
import { FeaturedFestivalSection } from "../FeaturedFestivalSection";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ fill: _fill, priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

const emptyProductsResponse = {
  data: [],
};

describe("FeaturedFestivalSection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows no offers available when the offers API returns no products", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => emptyProductsResponse }));

    render(<FeaturedFestivalSection />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("No offers available")).toBeInTheDocument();
    expect(screen.getByText("Current Offers")).toBeInTheDocument();
  });

  it("shows the current offers carousel copy and links to the offer collection", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        data: [{
          id: "banner-1",
          image_url: "https://example.com/banner.jpg",
          alt_text: "Diwali deal",
          offer_id: "offer-1",
        }],
      }) }));

    render(<FeaturedFestivalSection />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("Explore exclusive pieces with special pricing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop offer/i })).toHaveAttribute("href", "/collections?offers=active&offer_id=offer-1");
  });

  it("routes the active banner to the selected offer collection", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        data: [{
          id: "banner-1",
          image_url: "https://example.com/banner.jpg",
          alt_text: "Diwali deal",
          offer_id: "offer-1",
        }],
      }) }));

    render(<FeaturedFestivalSection />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByRole("link", { name: /shop offer/i })).toHaveAttribute("href", "/collections?offers=active&offer_id=offer-1");
  });

  it("shows the fallback CTA when the offers API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    render(<FeaturedFestivalSection />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText(/we couldn't load our offers right now/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop offer/i })).toHaveAttribute("href", "/collections?offers=active");
  });
});
