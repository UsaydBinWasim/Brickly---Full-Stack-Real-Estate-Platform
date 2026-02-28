"use client";

import { useState } from "react";

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  type: "rent" | "sale";
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  submitLabel?: string;
  loading?: boolean;
}

const emptyForm: PropertyFormData = {
  title: "",
  description: "",
  price: "",
  location: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  type: "sale",
};

export default function PropertyForm({
  initialData,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
}: PropertyFormProps) {
  const [form, setForm] = useState<PropertyFormData>({
    ...emptyForm,
    ...initialData,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          placeholder="Modern 3-bed apartment in Downtown"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
          placeholder="Describe the property..."
        />
      </div>

      {/* Price + Type row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Price ($)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            min={0}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="250000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          placeholder="New York, NY"
        />
      </div>

      {/* Beds / Baths / Area */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Beds</label>
          <input
            name="bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={handleChange}
            min={0}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Baths</label>
          <input
            name="bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={handleChange}
            min={0}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Area (sqft)</label>
          <input
            name="area"
            type="number"
            value={form.area}
            onChange={handleChange}
            min={0}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="1200"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
