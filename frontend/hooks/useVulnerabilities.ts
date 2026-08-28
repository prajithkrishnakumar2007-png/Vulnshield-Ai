import { useState, useEffect, useCallback, useRef } from "react";
import { fetchApi } from "../lib/api";
import { Vulnerability, VulnerabilityListResponse, VulnStatus } from "../lib/types";

interface UseVulnerabilitiesParams {
  status?: string;
  severity?: string;
  search?: string;
  kev_only?: boolean;
}

// Global in-memory cache for instant 0ms transitions across all tabs
const queryCache = new Map<string, VulnerabilityListResponse>();

export function useVulnerabilities(params: UseVulnerabilitiesParams = {}) {
  const queryParts: string[] = [];
  if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
  if (params.severity) queryParts.push(`severity=${encodeURIComponent(params.severity)}`);
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.kev_only) queryParts.push(`kev_only=true`);

  const cacheKey = queryParts.sort().join("&") || "all";
  const cached = queryCache.get(cacheKey);

  const [data, setData] = useState<VulnerabilityListResponse | null>(cached || null);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  const loadVulnerabilities = useCallback(async (silent = false) => {
    if (!silent && !queryCache.has(cacheKey)) {
      setLoading(true);
    }
    setError(null);
    try {
      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const result = await fetchApi<VulnerabilityListResponse>(`/vulnerabilities/${queryString}`);
      queryCache.set(cacheKey, result);
      if (isMounted.current) {
        setData(result);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Failed to load vulnerabilities");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, queryParts.join("&")]);

  useEffect(() => {
    isMounted.current = true;
    // Serve from cache immediately, then revalidate in background
    if (queryCache.has(cacheKey)) {
      setData(queryCache.get(cacheKey)!);
      setLoading(false);
      loadVulnerabilities(true);
    } else {
      loadVulnerabilities(false);
    }
    return () => {
      isMounted.current = false;
    };
  }, [cacheKey]);

  // Optimistic status update helper
  const updateStatus = async (id: number, newStatus: VulnStatus) => {
    if (!data) return;
    const previous = { ...data };
    
    // Optimistic UI update
    const updated = {
      ...data,
      items: data.items.map(v => v.id === id ? { ...v, status: newStatus } : v)
    };
    setData(updated);
    queryCache.set(cacheKey, updated);

    try {
      await fetchApi<Vulnerability>(`/vulnerabilities/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      loadVulnerabilities(true);
    } catch (err) {
      // Rollback on failure
      setData(previous);
      queryCache.set(cacheKey, previous);
      throw err;
    }
  };

  return { data, loading, error, refresh: () => loadVulnerabilities(false), updateStatus };
}
