/**
 * React hook for accessing admin-synced data
 * Provides real-time updates for offers, prices, and banners
 */

import { useState, useEffect, useCallback } from "react";
import {
  fetchAllSiteData,
  getSiteData,
  subscribeToSiteData,
  setupRealtimeSync,
  SiteData,
  getBannerItems,
  getProductsWithActiveOffers,
  getFeaturedProducts,
  calculateDiscountedPrice,
} from "@/lib/admin-sync";

export function useAdminData(options: { autoRefresh?: boolean; realtime?: boolean } = {}) {
  const { autoRefresh = true, realtime = true } = options;
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const siteData = await getSiteData();
        setData(siteData);
      } catch (err) {
        console.error("[useAdminData] Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Setup realtime sync if enabled
    if (realtime) {
      cleanup = setupRealtimeSync();
    }

    // Subscribe to data updates
    const unsubscribe = subscribeToSiteData((newData) => {
      setData(newData);
    });

    // Auto-refresh interval (every 5 minutes)
    let refreshInterval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      refreshInterval = setInterval(async () => {
        try {
          await fetchAllSiteData();
        } catch (err) {
          console.error("[useAdminData] Auto-refresh failed:", err);
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (cleanup) cleanup();
      unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh, realtime]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchAllSiteData();
    } catch (err) {
      console.error("[useAdminData] Refresh failed:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    getBannerItems: useCallback(() => (data ? getBannerItems(data) : []), [data]),
    getProductsWithActiveOffers: useCallback(() => (data ? getProductsWithActiveOffers(data) : []), [data]),
    getFeaturedProducts: useCallback(() => (data ? getFeaturedProducts(data) : []), [data]),
    calculateDiscountedPrice: useCallback((price: number, offer: any) => calculateDiscountedPrice(price, offer), []),
  };
}

/**
 * Simpler hook for just banner data
 */
export function useBannerData() {
  const { data, loading, error, getBannerItems } = useAdminData();
  return {
    items: getBannerItems(),
    loading,
    error,
  };
}

/**
 * Simpler hook for just offers data
 */
export function useOffersData() {
  const { data, loading, error, getProductsWithActiveOffers } = useAdminData();
  return {
    offers: data?.offers || [],
    products: getProductsWithActiveOffers(),
    loading,
    error,
  };
}

/**
 * Simpler hook for just featured products
 */
export function useFeaturedProducts() {
  const { data, loading, error, getFeaturedProducts } = useAdminData();
  return {
    products: getFeaturedProducts(),
    loading,
    error,
  };
}
