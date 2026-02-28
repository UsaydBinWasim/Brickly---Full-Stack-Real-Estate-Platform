"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/AdminTable";
import { apiFetch, getToken, getUser } from "@/lib/api";
import type { Property, PaginatedResponse } from "@/types";

type StatusFilter = "" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [loading, setLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchProperties();
  }, [router]);

  const fetchProperties = async () => {
    setPageLoading(true);
    try {
      const res = await apiFetch<PaginatedResponse<Property>>("/admin/properties?limit=100");
      if (res.success) {
        setProperties(Array.isArray(res.data) ? res.data : res.data.results || []);
      }
    } catch {
      console.error("Failed to fetch admin properties");
    } finally {
      setPageLoading(false);
    }
  };

  const filtered = statusFilter
    ? properties.filter((p) => p.status === statusFilter)
    : properties;

  const counts = {
    all: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  };

  const handleApprove = async (id: string) => {
    setLoading(id);
    try {
      const res = await apiFetch(`/admin/properties/${id}/approve`, { method: "PATCH" });
      if (res.success) {
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: "approved" as const } : p))
        );
      }
    } catch {
      console.error("Failed to approve");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(id);
    try {
      const res = await apiFetch(`/admin/properties/${id}/reject`, { method: "PATCH" });
      if (res.success) {
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: "rejected" as const } : p))
        );
      }
    } catch {
      console.error("Failed to reject");
    } finally {
      setLoading(null);
    }
  };

  if (pageLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center text-muted">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted">Manage and moderate property listings</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "All", value: counts.all, filter: "" as StatusFilter, color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
          { label: "Pending", value: counts.pending, filter: "pending" as StatusFilter, color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
          { label: "Approved", value: counts.approved, filter: "approved" as StatusFilter, color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
          { label: "Rejected", value: counts.rejected, filter: "rejected" as StatusFilter, color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
        ].map((card) => (
          <button
            key={card.label}
            onClick={() => setStatusFilter(card.filter)}
            className={`rounded-xl border p-4 text-left transition-all ${
              statusFilter === card.filter
                ? "border-primary shadow-md"
                : "border-border shadow-sm hover:shadow-md"
            } bg-surface`}
          >
            <p className="text-2xl font-bold">{card.value}</p>
            <p className={`mt-1 text-xs font-semibold rounded-full inline-block px-2 py-0.5 ${card.color}`}>
              {card.label}
            </p>
          </button>
        ))}
      </div>

      {/* Properties table */}
      <AdminTable
        properties={filtered}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />
    </div>
  );
}
