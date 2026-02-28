"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import { apiFetch } from "@/lib/api";
import type { Property, PaginatedResponse } from "@/types";

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<PaginatedResponse<Property>>("/properties?limit=3");
        if (res.success) {
          setFeaturedProperties(res.data.results);
        }
      } catch {
        // Silently fail — hero still renders
      }
    })();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Find Your Dream<br className="hidden sm:block" /> Property with <span className="text-blue-200">Brickly</span>
          </h1>
          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
            Browse thousands of listings, save your favorites, and connect with sellers — all in one modern platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properties"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-lg"
            >
              Browse Properties
            </Link>
            <Link
              href="/register"
              className="rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "2,500+", label: "Active Listings" },
            { value: "1,200+", label: "Happy Buyers" },
            { value: "50+", label: "Cities Covered" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <p className="mt-1 text-sm text-muted">Hand-picked listings just for you</p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.length > 0
            ? featuredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))
            : [1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-white border border-border shadow-sm p-8 text-center text-muted animate-pulse h-64" />
              ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">Ready to list your property?</h2>
          <p className="mt-2 text-muted max-w-lg mx-auto">
            Join thousands of property owners using Brickly to reach qualified buyers and renters.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-md"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </>
  );
}
