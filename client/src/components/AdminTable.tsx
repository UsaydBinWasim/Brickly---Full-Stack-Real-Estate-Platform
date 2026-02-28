"use client";

import type { Property } from "@/types";

interface AdminTableProps {
  properties: Property[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: string | null;
}

function StatusBadge({ status }: { status: Property["status"] }) {
  const styles: Record<Property["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminTable({ properties, onApprove, onReject, loading }: AdminTableProps) {
  if (properties.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-border shadow-sm p-12 text-center">
        <p className="text-muted">No properties found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="px-6 py-3 text-left font-semibold text-muted">Title</th>
              <th className="px-6 py-3 text-left font-semibold text-muted">Location</th>
              <th className="px-6 py-3 text-left font-semibold text-muted">Price</th>
              <th className="px-6 py-3 text-left font-semibold text-muted">Owner</th>
              <th className="px-6 py-3 text-left font-semibold text-muted">Status</th>
              <th className="px-6 py-3 text-right font-semibold text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {properties.map((property) => (
              <tr key={property._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                  {property.title}
                </td>
                <td className="px-6 py-4 text-muted whitespace-nowrap">{property.location}</td>
                <td className="px-6 py-4 text-foreground whitespace-nowrap">
                  ${property.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-muted whitespace-nowrap">
                  {property.user?.email ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={property.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {property.status !== "approved" && (
                      <button
                        onClick={() => onApprove(property._id)}
                        disabled={loading === property._id}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {property.status !== "rejected" && (
                      <button
                        onClick={() => onReject(property._id)}
                        disabled={loading === property._id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
