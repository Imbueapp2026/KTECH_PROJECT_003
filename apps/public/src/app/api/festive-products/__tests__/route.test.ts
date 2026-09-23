import { describe, expect, it, vi } from "vitest";
import { GET } from "../route";

const { getAnonClient } = vi.hoisted(() => ({
  getAnonClient: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getAnonClient,
}));

vi.mock("@/lib/cors", () => ({
  handlePreflight: vi.fn(() => null),
  withCors: vi.fn((response: Response) => response),
}));

function createQuery(result: unknown) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    single: vi.fn(() => query),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };

  return query;
}

describe("GET /api/festive-products", () => {
  it("returns festival products with their related offer", async () => {
    const festivalQuery = createQuery({
      data: {
        id: "festival-1",
        name: "Diwali",
        description: "Festival collection",
        image_url: null,
      },
      error: null,
    });
    const productsQuery = createQuery({
      data: [
        {
          id: "product-1",
          name: "Gold Ring",
          festival_id: "festival-1",
          price: 50000,
          categories: { id: "category-1", name: "Rings", slug: "rings" },
          offers: { id: "offer-1", label: "Diwali Offer", is_active: true },
        },
      ],
      error: null,
    });

    getAnonClient.mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(festivalQuery)
        .mockReturnValueOnce(productsQuery),
    });

    const response = await GET(new Request("http://localhost/api/festive-products?limit=4"));
    const body = await response.json();

    expect(body.data[0]).toMatchObject({
      id: "product-1",
      category: { id: "category-1", name: "Rings", slug: "rings" },
      offer: { id: "offer-1", label: "Diwali Offer", is_active: true },
      source: "festival",
    });
    expect(body.data[0].categories).toBeUndefined();
    expect(body.data[0].offers).toBeUndefined();
  });
});
