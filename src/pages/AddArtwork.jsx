
import { useState, useEffect } from "react";
import { fetcher } from "../utils/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";

export default function ArtworkForm({
  artwork = null,
  onCreatedOrUpdated = null,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    imageUrl: "",
    title: "",
    artistName: "",
    category: "",
    medium: "",
    description: "",
    dimensions: "",
    price: "",
    visibility: "public",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (artwork) {
      setForm({
        imageUrl: artwork.imageUrl || "",
        title: artwork.title || "",
        artistName: artwork.artistName || "",
        category: artwork.category || "",
        medium: artwork.medium || "",
        description: artwork.description || "",
        dimensions: artwork.dimensions || "",
        price: artwork.price || "",
        visibility: artwork.visibility || "public",
      });
    } else {
      // prefill artistName from auth if available
      const u = auth.currentUser;
      if (u && (u.displayName || u.email)) {
        setForm((f) => ({ ...f, artistName: u.displayName || u.email }));
      }
    }
  }, [artwork]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.imageUrl) {
      Swal.fire("Validation", "Title and Image URL are required", "warning");
      return;
    }

    setSubmitting(true);

    try {
      if (artwork && artwork._id) {
  
        const rawId =
          typeof artwork._id === "string" ? artwork._id : String(artwork._id);
        const id = rawId.trim();

        const res = await fetcher(`/items/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const updated = res?.data ?? res ?? null;
        Swal.fire("Updated!", "Artwork updated successfully", "success");

        if (typeof onCreatedOrUpdated === "function") {
          onCreatedOrUpdated(updated);
        } else {
    
          navigate(`/items/${id}`);
        }
      } else {
        // CREATE
        const u = auth.currentUser;
        const payload = {
          ...form,
          artistName:
            form.artistName || (u && (u.displayName || u.email)) || "",
          userEmail: (u && u.email) || "",
          createdAt: new Date().toISOString(),
        };

        const res = await fetcher("/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const created = res?.data ?? res ?? null;
        Swal.fire("Added!", "Artwork added successfully", "success");

        if (typeof onCreatedOrUpdated === "function") {
          onCreatedOrUpdated(created);
        } else {
     
          navigate("/my-gallery");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      const msg =
        err?.message || (err?.body && err.body.message) || "Server error";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white border border-purple-300 rounded-2xl shadow-xl">
      <h2 className="text-4xl font-bold mb-8 text-purple-700 text-center">
        {artwork && artwork._id ? "Update Artwork" : "Add Artwork"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image URL */}
        <div>
          <label className="block mb-2 font-semibold text-purple-700">
            Image URL *
          </label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        {/* Title & Artist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-purple-700">
              Artwork Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Majestic Waterfall"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-purple-700">
              Artist Name *
            </label>
            <input
              name="artistName"
              value={form.artistName}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Aiden Park"
              required
            />
          </div>
        </div>

        {/* Category & Medium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-purple-700">
              Category
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Nature, Portrait, Abstract..."
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-purple-700">
              Medium / Tools
            </label>
            <input
              name="medium"
              value={form.medium}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Photography, Digital, Oil Paint..."
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-semibold text-purple-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none h-28"
            placeholder="Describe your artwork..."
          />
        </div>

        {/* Dimensions & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-purple-700">
              Dimensions
            </label>
            <input
              name="dimensions"
              value={form.dimensions}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="20x30 cm"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-purple-700">
              Price
            </label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block mb-2 font-semibold text-purple-700">
            Visibility
          </label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="w-full p-3 border border-purple-300 rounded-lg bg-purple-50 text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold text-lg transition-all"
        >
          {submitting
            ? "Saving..."
            : artwork && artwork._id
            ? "Update Artwork"
            : "Add Artwork"}
        </button>
      </form>
    </div>
  );
}
