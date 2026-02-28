"use client";

import { useState, useRef } from "react";

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

interface ExistingImage {
  url: string;
  publicId: string;
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  existingImages?: ExistingImage[];
  onSubmit: (data: PropertyFormData, images: File[], keepImages: string[]) => void;
  submitLabel?: string;
  loading?: boolean;
  editWarning?: boolean;
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
  existingImages = [],
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  editWarning = false,
}: PropertyFormProps) {
  const [form, setForm] = useState<PropertyFormData>({
    ...emptyForm,
    ...initialData,
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keptExisting, setKeptExisting] = useState<ExistingImage[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = keptExisting.length + images.length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (totalImages + files.length > 6) {
      alert("Maximum 6 images allowed");
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (publicId: string) => {
    setKeptExisting((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keepIds = keptExisting.map((img) => img.publicId);
    onSubmit(form, images, keepIds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {editWarning && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Editing this listing will reset its status to <em>pending</em> and require re-approval by an admin.
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="250000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="1200"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Property Images ({totalImages}/6)
        </label>

        {/* Existing images */}
        {keptExisting.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-3">
            {keptExisting.map((img) => (
              <div key={img.publicId} className="relative group rounded-lg overflow-hidden h-24 border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.publicId)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">
                  Existing
                </span>
              </div>
            ))}
          </div>
        )}

        {totalImages < 6 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <svg className="w-8 h-8 mx-auto text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-muted">Click to upload images</p>
            <p className="text-xs text-muted mt-1">JPG, PNG, WebP — max 5MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        )}

        {/* New image previews */}
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden h-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <span className="absolute bottom-1 left-1 bg-primary/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                  New
                </span>
              </div>
            ))}
          </div>
        )}
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
