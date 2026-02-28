"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

const propertyTypes = [
  { value: "", label: "All Types" },
  { value: "rent", label: "For Rent" },
  { value: "sale", label: "For Sale" },
];

const bedroomOptions = [
  { value: "", label: "Any" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4+" },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/properties?${params.toString()}`);
  }, [location, type, bedrooms, minPrice, maxPrice, router]);

  const clearFilters = () => {
    setLocation("");
    setType("");
    setBedrooms("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/properties");
  };

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="rounded-xl bg-surface border border-border shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold">Filters</h2>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. New York"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {/* Property type */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          >
            {propertyTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Bedrooms</label>
          <div className="flex gap-2">
            {bedroomOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBedrooms(opt.value)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition ${
                  bedrooms === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={applyFilters}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
}
