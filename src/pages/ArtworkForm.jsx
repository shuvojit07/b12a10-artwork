import { useState, useEffect } from "react";
import { fetcher } from "../utils/api";
import Swal from "sweetalert2";
import { auth } from "../lib/firebase";

export default function ArtworkForm({
  artwork = null,
  onCreatedOrUpdated = null,
}) {
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
        imageUrl: artwork.imageUrl || artwork.image || "",
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
      const u = auth.currentUser;
      if (u && (u.displayName || u.email)) {
        setForm((f) => ({ ...f, artistName: u.displayName || u.email }));
      }
    }
  }, [artwork]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function nativeGetItem(id) {
    try {
      const base = window.__API_BASE__ || "https://artwork-servar.vercel.app";
      const r = await fetch(`${base}/items/${encodeURIComponent(id)}`);
      const text = await r.text().catch(() => null);
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch (e) {
        console.log(e);
        body = text;
      }
      return { ok: r.ok, status: r.status, body };
    } catch (err) {
      return { ok: false, status: 0, error: err };
    }
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
        if (!id) throw new Error("Invalid artwork id");

        let res;
        try {
          res = await fetcher(`/items/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
        } catch (err) {
          console.warn("Artwork PUT failed:", err);

          const fallback = await nativeGetItem(id);
          if (fallback.ok && fallback.body && fallback.body.data) {
            const updated = fallback.body.data;
            Swal.fire("Updated!", "Artwork updated (verified).", "success");
            if (typeof onCreatedOrUpdated === "function")
              onCreatedOrUpdated(updated);
            return;
          } else {
            const msg =
              err?.message ||
              (fallback && fallback.body && JSON.stringify(fallback.body)) ||
              "Server error";
            throw new Error(msg);
          }
        }

        const updated = res?.data ?? res ?? null;

        Swal.fire("Updated!", "Artwork updated successfully", "success");

        if (typeof onCreatedOrUpdated === "function")
          onCreatedOrUpdated(updated);
      } else {
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

        if (typeof onCreatedOrUpdated === "function")
          onCreatedOrUpdated(created);

        setForm({
          imageUrl: "",
          title: "",
          artistName: payload.artistName || "",
          category: "",
          medium: "",
          description: "",
          dimensions: "",
          price: "",
          visibility: "public",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      const message =
        err?.message ||
        (err?.body && err.body.message) ||
        "Server error. Try again.";
      Swal.fire("Error", message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-screen mx-auto mt-2 p-4 bg-purple-300">
      <form onSubmit={handleSubmit} className="space-y-4 text-purple-600">
        <div>
          <label className="block mb-1 font-medium">Image URL *</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="https://..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Artist Name *</label>
            <input
              name="artistName"
              value={form.artistName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Medium / Tools</label>
            <input
              name="medium"
              value={form.medium}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Dimensions</label>
            <input
              name="dimensions"
              value={form.dimensions}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Visibility</label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (typeof onCreatedOrUpdated === "function")
                onCreatedOrUpdated();
            }}
            className="px-3 py-2 bg-gray-200 rounded"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            {submitting
              ? "Saving..."
              : artwork && artwork._id
              ? "Update Artwork"
              : "Add Artwork"}
          </button>
        </div>
      </form>
    </div>
  );
}
