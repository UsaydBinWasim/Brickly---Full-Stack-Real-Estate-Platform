"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import PropertyForm from "@/components/PropertyForm";
import { apiFetch, getToken } from "@/lib/api";
import type { Property } from "@/types";

function StatusBadge({ status }: { status: Property["status"] }) {
  const styles: Record<Property["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    fetchListings();
  }, [router]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Property[]>("/properties/my");
      if (res.success) {
        setListings(res.data);
      }
    } catch {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: { title: string; description: string; price: string; location: string; bedrooms: string; bathrooms: string; area: string; type: "rent" | "sale" }, images: File[] = []) => {
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("location", data.location);
      formData.append("bedrooms", data.bedrooms);
      formData.append("bathrooms", data.bathrooms);
      formData.append("area", data.area);
      formData.append("type", data.type);
      images.forEach((img) => formData.append("images", img));

      const res = await apiFetch<Property>("/properties", {
        method: "POST",
        body: formData,
      });
      if (res.success) {
        setShowForm(false);
        fetchListings();
      } else {
        setError(res.message || "Failed to create listing");
      }
    } catch {
      setError("Failed to create listing");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: { title: string; description: string; price: string; location: string; bedrooms: string; bathrooms: string; area: string; type: "rent" | "sale" }, images: File[] = [], keepImages: string[] = []) => {
    if (!editingProperty) return;
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("location", data.location);
      formData.append("bedrooms", data.bedrooms);
      formData.append("bathrooms", data.bathrooms);
      formData.append("area", data.area);
      formData.append("type", data.type);
      formData.append("keepImages", JSON.stringify(keepImages));
      images.forEach((img) => formData.append("images", img));

      const res = await apiFetch<Property>(`/properties/${editingProperty._id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.success) {
        setEditingProperty(null);
        fetchListings();
      } else {
        setError(res.message || "Failed to update listing");
      }
    } catch {
      setError("Failed to update listing");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await apiFetch(`/properties/${id}`, { method: "DELETE" });
      if (res.success) {
        setListings((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      setError("Failed to delete listing");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Listings</h1>
              <p className="mt-1 text-sm text-muted">{listings.length} properties listed</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingProperty(null);
              }}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? "Cancel" : "New Listing"}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* New listing form */}
          {showForm && !editingProperty && (
            <div className="rounded-xl bg-surface border border-border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Listing</h2>
              <PropertyForm
                onSubmit={handleCreate}
                submitLabel="Create Listing"
                loading={formLoading}
              />
            </div>
          )}

          {/* Edit listing form */}
          {editingProperty && (
            <div className="rounded-xl bg-surface border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Edit Listing</h2>
                <button
                  onClick={() => setEditingProperty(null)}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
              <PropertyForm
                key={editingProperty._id}
                initialData={{
                  title: editingProperty.title,
                  description: editingProperty.description,
                  price: String(editingProperty.price),
                  location: editingProperty.location,
                  bedrooms: editingProperty.bedrooms != null ? String(editingProperty.bedrooms) : "",
                  bathrooms: editingProperty.bathrooms != null ? String(editingProperty.bathrooms) : "",
                  area: editingProperty.area != null ? String(editingProperty.area) : "",
                  type: editingProperty.type || "sale",
                }}
                existingImages={editingProperty.images || []}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                loading={formLoading}
                editWarning
              />
            </div>
          )}

          {/* Listings table */}
          {loading ? (
            <div className="rounded-xl bg-surface border border-border shadow-sm p-12 text-center">
              <p className="text-muted">Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border shadow-sm p-12 text-center">
              <p className="text-muted">You have no listings yet. Create one above!</p>
            </div>
          ) : (
            <div className="rounded-xl bg-surface border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt">
                      <th className="px-6 py-3 text-left font-semibold text-muted">Property</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted">Price</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted">Status</th>
                      <th className="px-6 py-3 text-right font-semibold text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listings.map((listing) => (
                      <tr key={listing._id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{listing.title}</p>
                          <p className="text-xs text-muted mt-0.5">{listing.location}</p>
                        </td>
                        <td className="px-6 py-4 text-foreground whitespace-nowrap">
                          ${listing.price.toLocaleString()}
                          {listing.type === "rent" && <span className="text-muted">/mo</span>}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={listing.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProperty(listing);
                                setShowForm(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(listing._id)}
                              className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
