"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch, getToken, getUser, imageUrl } from "@/lib/api";
import type { Property } from "@/types";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch<Property>(`/properties/${id}`);
        if (res.success) {
          setProperty(res.data);
        } else {
          setError(res.message || "Property not found");
        }
      } catch {
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleFavorite = async () => {
    if (!getToken()) {
      setFavMsg("Please log in to save favorites");
      return;
    }
    try {
      const res = await apiFetch(`/favorites/${id}`, { method: "POST" });
      if (res.success) {
        setFavMsg("Saved to favorites!");
      } else {
        setFavMsg(res.message || "Could not save");
      }
    } catch {
      setFavMsg("Failed to save favorite");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center text-muted">
        Loading property...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <p className="text-red-600">{error || "Property not found"}</p>
        <Link href="/properties" className="mt-4 inline-block text-primary hover:underline">
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Back link */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Image gallery + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main image */}
          <div className="rounded-xl overflow-hidden bg-linear-to-br from-blue-100 to-blue-50 h-80 sm:h-96 flex items-center justify-center relative">
            {property.images && property.images.length > 0 ? (
              <Image
                src={imageUrl(property.images[activeImage]?.url)}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            ) : (
              <svg className="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
            )}
          </div>

          {/* Thumbnail row */}
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {property.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-lg overflow-hidden h-20 border-2 transition-colors relative ${
                    activeImage === i ? "border-primary" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image src={imageUrl(img.url)} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="100px" />
                </button>
              ))}
            </div>
          )}
          {(!property.images || property.images.length <= 1) && (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-50 h-20 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="rounded-xl bg-surface border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <div className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          </div>
        </div>

        {/* Right: Details sidebar */}
        <div className="space-y-6">
          {/* Price card */}
          <div className="rounded-xl bg-surface border border-border shadow-sm p-6">
            {property.type && (
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase mb-3">
                For {property.type}
              </span>
            )}
            <p className="text-3xl font-bold text-primary">
              ${property.price.toLocaleString()}
              {property.type === "rent" && (
                <span className="text-base font-normal text-muted">/mo</span>
              )}
            </p>
            <h1 className="mt-2 text-xl font-semibold">{property.title}</h1>
            <p className="mt-1 text-sm text-muted flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.location}
            </p>
          </div>

          {/* Property details */}
          <div className="rounded-xl bg-surface border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.bedrooms != null && (
                <div className="rounded-lg bg-surface-alt p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{property.bedrooms}</p>
                  <p className="text-xs text-muted">Bedrooms</p>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="rounded-lg bg-surface-alt p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{property.bathrooms}</p>
                  <p className="text-xs text-muted">Bathrooms</p>
                </div>
              )}
              {property.area != null && (
                <div className="rounded-lg bg-surface-alt p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{property.area}</p>
                  <p className="text-xs text-muted">Sq Ft</p>
                </div>
              )}
              <div className="rounded-lg bg-surface-alt p-3 text-center">
                <p className="text-lg font-bold text-foreground capitalize">{property.type ?? "—"}</p>
                <p className="text-xs text-muted">Type</p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleFavorite}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Save to Favorites
          </button>
          {favMsg && (
            <p className="text-center text-sm text-muted">{favMsg}</p>
          )}

          {/* Contact owner */}
          <button
            onClick={async () => {
              if (!getToken()) {
                router.push("/login");
                return;
              }
              const user = getUser();
              if (user?._id === property.user._id) return;
              try {
                const res = await apiFetch<{ _id: string }>("/chat/conversations", {
                  method: "POST",
                  body: JSON.stringify({ propertyId: property._id }),
                });
                if (res.success) {
                  router.push(`/chat?c=${res.data._id}`);
                }
              } catch {
                alert("Failed to start conversation");
              }
            }}
            className="w-full rounded-xl border-2 border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
}
