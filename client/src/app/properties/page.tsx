"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import FilterSidebar from "@/components/FilterSidebar";
import { apiFetch } from "@/lib/api";
import type { Property, PaginatedResponse } from "@/types";

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const location = searchParams.get("location");
      const type = searchParams.get("type");
      const bedrooms = searchParams.get("bedrooms");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");

      if (location) params.set("location", location);
      if (type) params.set("type", type);
      if (bedrooms) params.set("bedrooms", bedrooms);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("page", String(page));
      params.set("limit", "9");

      const res = await apiFetch<PaginatedResponse<Property>>(`/properties?${params.toString()}`);
      if (res.success) {
        setProperties(res.data.results);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      console.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Browse Properties</h1>
        <p className="mt-1 text-sm text-muted">
          {total} approved listing{total !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Filter sidebar */}
        <FilterSidebar />

        {/* Right: Property grid */}
        <div className="flex-1">
          {loading ? (
            <div className="rounded-xl bg-surface border border-border shadow-sm p-12 text-center">
              <p className="text-muted">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border shadow-sm p-12 text-center">
              <p className="text-muted">No properties match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted disabled:opacity-50 hover:bg-surface-hover transition-colors"
              >
                Previous
              </button>
              <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted disabled:opacity-50 hover:bg-surface-hover transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-muted">
          Loading properties...
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
