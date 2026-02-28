import Link from "next/link";
import Image from "next/image";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
}

function formatPrice(price: number, type?: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
  return type === "rent" ? `${formatted}/mo` : formatted;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property._id}`} className="group block">
      <div className="rounded-xl bg-surface shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-border">
        {/* Image */}
        <div className="relative h-48 bg-linear-to-br from-blue-100 to-blue-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0].url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
          )}
          {property.type && (
            <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white uppercase">
              For {property.type}
            </span>
          )}
          {property.images && property.images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              +{property.images.length - 1} photos
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-lg font-bold text-primary">
            {formatPrice(property.price, property.type)}
          </p>
          <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {property.title}
          </h3>
          <p className="mt-1 text-sm text-muted line-clamp-1">{property.location}</p>

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18m-9 5h9" />
                </svg>
                {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-4 4V3M3 11h18M3 15h18" />
                </svg>
                {property.bathrooms} Baths
              </span>
            )}
            {property.area != null && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                {property.area} sqft
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
