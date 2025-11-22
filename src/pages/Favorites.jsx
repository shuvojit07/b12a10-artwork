import { useEffect, useState, useCallback } from "react";
import { fetcher } from "../utils/api";
import { auth } from "../lib/firebase";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const idStr = (v) => (v === undefined || v === null ? "" : String(v));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const res = await fetcher(
        `/favorites?userEmail=${encodeURIComponent(user.email)}`
      );
      const favs = res?.data || [];

      const detailed = await Promise.allSettled(
        favs.map(async (f) => {
          if (!f || !f.itemId) return { ...f, artwork: null };
          try {
            const art = await fetcher(
              `/items/${encodeURIComponent(String(f.itemId))}`
            );
            return { ...f, artwork: art?.data ?? null };
          } catch (err) {
            console.log(err);
            return { ...f, artwork: null };
          }
        })
      );

      const out = detailed.map((s, i) =>
        s.status === "fulfilled" ? s.value : { ...favs[i], artwork: null }
      );
      setFavorites(Array.isArray(out) ? out : []);
    } catch (err) {
      console.error("Load favorites error:", err);
      Swal.fire("Error", "Could not load favorites.", "error");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  async function nativeDelete(url) {
    try {
      const r = await fetch(url, { method: "DELETE" });
      const text = await r.text().catch(() => null);
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch (e) {
        console.log(e);
        body = text;
      }
      return { ok: r.ok, status: r.status, body, rawText: text };
    } catch (err) {
      return { ok: false, status: 0, error: err };
    }
  }

  async function removeFav(rawId, fallbackItemId = null) {
    const id = idStr(rawId);
    if (!id && !fallbackItemId) {
      Swal.fire("Error", "Invalid id", "error");
      return;
    }

    if (id && deletingIds.has(id)) return;
    if (!id && fallbackItemId && deletingIds.has(fallbackItemId)) return;

    const ok = await Swal.fire({
      title: "Remove favorite?",
      text: "This will remove the artwork from your favorites.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
    });
    if (!ok.isConfirmed) return;

    const key = id || String(fallbackItemId);

    setDeletingIds((s) => new Set(s).add(key));
    const prev = [...favorites];

    setFavorites((favs) =>
      favs.filter(
        (f) =>
          idStr(f._id) !== id &&
          idStr(f.itemId) !== id &&
          idStr(f.itemId) !== String(fallbackItemId)
      )
    );

    const apiBase = window.__API_BASE__ || "";
    try {
      if (id) {
        try {
          await fetcher(`/favorites/${encodeURIComponent(id)}`, {
            method: "DELETE",
          });

          await load();
          Swal.fire("Removed", "Favorite removed.", "success");
          return;
        } catch (err) {
          console.warn("fetcher DELETE by _id failed:", err);
          // if 404 -> maybe already removed; re-sync
          if (
            err?.status === 404 ||
            /not\s*found/i.test(String(err?.message || ""))
          ) {
            await load();
            Swal.fire("Removed", "Favorite already removed (synced).", "info");
            return;
          }
          // else fallthrough to native fallback or try itemId
        }

        // native fallback (in case fetcher swallows response details)
        if (apiBase) {
          const native = await nativeDelete(
            `${apiBase}/favorites/${encodeURIComponent(id)}`
          );
          if (native.ok || (native.status >= 200 && native.status < 300)) {
            await load();
            Swal.fire("Removed", "Favorite removed.", "success");
            return;
          }
          if (
            native.status === 404 ||
            (typeof native.body === "string" &&
              /not\s*found/i.test(native.body))
          ) {
            await load();
            Swal.fire("Removed", "Favorite already removed (synced).", "info");
            return;
          }
        }
      }

      // If we got here, id deletion didn't work -> try delete by itemId (fallback)
      const maybe =
        fallbackItemId ||
        (() => {
          // try to locate itemId from prev favorites matching id
          const match = prev.find((f) => idStr(f._id) === id);
          return match ? idStr(match.itemId) : null;
        })();

      if (maybe) {
        try {
          await fetcher(`/favorites/${encodeURIComponent(maybe)}`, {
            method: "DELETE",
          });
          await load();
          Swal.fire("Removed", "Favorite removed (by itemId).", "success");
          return;
        } catch (err2) {
          console.warn("fetcher DELETE by itemId failed:", err2);
          if (
            err2?.status === 404 ||
            /not\s*found/i.test(String(err2?.message || ""))
          ) {
            await load();
            Swal.fire("Removed", "Favorite already removed (synced).", "info");
            return;
          }
          // native fallback with apiBase
          if (apiBase) {
            const native2 = await nativeDelete(
              `${apiBase}/favorites/${encodeURIComponent(maybe)}`
            );
            if (native2.ok || (native2.status >= 200 && native2.status < 300)) {
              await load();
              Swal.fire("Removed", "Favorite removed (by itemId).", "success");
              return;
            }
            if (
              native2.status === 404 ||
              (typeof native2.body === "string" &&
                /not\s*found/i.test(native2.body))
            ) {
              await load();
              Swal.fire(
                "Removed",
                "Favorite was already removed (synced).",
                "info"
              );
              return;
            }
          }
        }
      }

      // If none of the deletions succeeded -> rollback and error
      setFavorites(prev);
      Swal.fire("Error", "Could not remove favorite. Try again.", "error");
    } catch (outerErr) {
      console.error("removeFav unexpected error:", outerErr);
      setFavorites(prev);
      Swal.fire("Error", "Could not remove favorite. Try again.", "error");
    } finally {
      setDeletingIds((s) => {
        const copy = new Set(s);
        copy.delete(key);
        return copy;
      });
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6 text-purple-700">
        My Favorites
      </h2>

      {favorites.length === 0 ? (
        <div className="text-gray-600">You have no favorites yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((f) => {
            const fid = idStr(f._id) || idStr(f.itemId) || Math.random();
            const isDeleting = fid && deletingIds.has(fid);

            return (
              <div
                key={fid}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                {f.artwork ? (
                  <img
                    src={f.artwork.imageUrl || f.artwork.image}
                    alt={f.artwork?.title || f.title || "Artwork"}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-center p-3">
                    <div>
                      <div className="text-gray-400 mb-2">No Image</div>
                      <div className="text-xs text-gray-500">
                        {f.title || "Artwork unavailable"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex-1">
                  <h3 className="text-lg font-semibold">
                    {f.artwork?.title || f.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {f.artwork?.category
                      ? `Category: ${f.artwork.category}`
                      : "Category: N/A"}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Saved:{" "}
                    {f.createdAt
                      ? new Date(f.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <button
                  onClick={() => removeFav(idStr(f._id), idStr(f.itemId))}
                  disabled={isDeleting}
                  className={`mt-4 w-full py-2 text-white rounded ${
                    isDeleting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isDeleting ? "Removing..." : "Remove"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
