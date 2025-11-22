
import { useEffect, useState } from "react";
import { fetcher } from "../utils/api";
import { auth } from "../lib/firebase";
import Swal from "sweetalert2";
import ArtworkForm from "./ArtworkForm";

export default function MyGallery() {
  const [user, setUser] = useState(auth.currentUser || null);
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingArt, setEditingArt] = useState(null);


  const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

 
  async function loadMyArtworks() {
    if (!user || !user.email) {
      setArts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetcher(
        `/items?userEmail=${encodeURIComponent(user.email)}&sort=createdAt_desc`
      );

      const items = res?.data || res || [];
      setArts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Load error:", err);
      Swal.fire("Error", "Failed to load artworks", "error");
      setArts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyArtworks();

  }, [user]);


  async function handleDelete(id) {
 
    const rawId = typeof id === "string" ? id : String(id || "");
    const normId = rawId.trim();
    if (!normId) {
      Swal.fire("Error", "Invalid id", "error");
      return;
    }


    if (deletingId === normId) return;

    const ok = await Swal.fire({
      title: "Delete Artwork?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#777",
      confirmButtonText: "Delete",
    });

    if (!ok.isConfirmed) return;

    console.log("[MyGallery] deleting id:", normId);

    // optimistic UI: remove locally immediately
    const prev = [...arts];
    const newList = prev.filter((a) => {
      const aId = a && a._id ? String(a._id).trim() : "";
      return aId !== normId;
    });
    setArts(newList);
    setDeletingId(normId);


    async function tryDeleteById(delId) {
      return fetcher(`/items/${encodeURIComponent(delId)}`, {
        method: "DELETE",
      });
    }

    try {
      
      const artObj = prev.find((a) => String(a._id).trim() === normId);

      
      try {
        const res = await tryDeleteById(normId);
        console.log("[MyGallery] delete response (by _id):", res);
        // success -> notify user
        Swal.fire("Deleted!", "Artwork has been removed.", "success");
      } catch (err) {
        console.warn("[MyGallery] delete by _id failed:", err);

       
        const status = err?.status || (err?.response && err.response.status);
        const msg = err?.message || (err?.response && err.response.data) || "";

        if (status === 404 || /not\s*found/i.test(String(msg))) {
          Swal.fire("Deleted", "Artwork already removed (synced).", "info");
        } else if (
          artObj &&
          artObj.itemId &&
          String(artObj.itemId).trim() !== normId
        ) {
     
          const fallbackId = String(artObj.itemId).trim();
          try {
            const res2 = await tryDeleteById(fallbackId);
            console.log("[MyGallery] delete response (by itemId):", res2);
            Swal.fire("Deleted!", "Artwork has been removed.", "success");
          } catch (err2) {
            console.error("[MyGallery] delete by itemId also failed:", err2);
           
            setArts(prev);
            const msg2 = err2?.message || "Failed to delete artwork";
            Swal.fire("Error", msg2, "error");
          }
        } else {
         
          setArts(prev);
          const human = err?.message || "Failed to delete artwork";
          Swal.fire("Error", human, "error");
        }
      }
    } catch (outerErr) {
      console.error("Delete flow unexpected error:", outerErr);
      setArts(prev);
      Swal.fire("Error", "Failed to delete artwork", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(art) {
    setEditingArt(art);
    setShowForm(true);
  }

  function handleCreate() {
    setEditingArt(null);
    setShowForm(true);
  }

  function handleFormClose() {
    setEditingArt(null);
    setShowForm(false);
  }

  async function handleUpdated() {
    await loadMyArtworks();
    handleFormClose();
    Swal.fire("Success", "Changes saved", "success");
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-xl">
        You must be logged in to view your gallery.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-purple-700">My Gallery</h2>

        <button
          type="button"
          onClick={handleCreate}
          className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          + Add New Artwork
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-lg">Loading...</div>
      ) : arts.length === 0 ? (
        <div className="text-center text-gray-600 text-lg">
          You have not added any artworks yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {arts.map((a) => {
            const aId = a && a._id ? String(a._id).trim() : "";
            const isDeleting = deletingId === aId;

            return (
              <div
                key={aId || Math.random()}
                className="bg-white rounded-lg shadow p-3 flex flex-col"
              >
                <img
                  src={a.imageUrl || a.image}
                  alt={a.title || "artwork"}
                  className="w-full h-56 object-cover rounded"
                />

                <div className="mt-3 flex-1">
                  <h3 className="text-xl font-semibold">{a.title}</h3>
                  <p className="text-gray-600 text-sm">{a.category}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    Artist: {a.artistName}
                  </p>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(a)}
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isDeleting}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(a._id)}
                    className={`px-4 py-1 text-white rounded ${
                      isDeleting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-12 pb-8 overflow-auto">
          <div className="bg-white p-5 rounded shadow-xl w-full max-w-3xl relative">
            <button
              onClick={handleFormClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              ✕
            </button>

            <ArtworkForm
              artwork={editingArt}
              onCreatedOrUpdated={handleUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
