// src/pages/ArtworkDetails/ArtworkDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetcher } from "../../utils/api";
import { auth } from "../../lib/firebase";
import Swal from "sweetalert2";

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const LOCAL_LIKES_KEY = "local_likes";
  const LOCAL_FAVS_KEY = "local_favorites";

  async function load() {
    setLoading(true);
    try {
      const res = await fetcher(`/items/${id}`);
      const data = res?.data ?? res ?? null;
      if (!data) {
        setArt(null);
        return;
      }
      const localMap = JSON.parse(
        localStorage.getItem(LOCAL_LIKES_KEY) || "{}"
      );
      const localDelta = localMap[data._id] || 0;
      setArt({ ...data, likes: (data.likes || 0) + localDelta });
    } catch (err) {
      console.error("load error:", err);
      setArt(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function saveLocalLikeDelta(itemId) {
    try {
      const map = JSON.parse(localStorage.getItem(LOCAL_LIKES_KEY) || "{}");
      map[itemId] = (map[itemId] || 0) + 1;
      localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn("Could not save local like:", e);
    }
  }

  function saveLocalFavorite(payload) {
    try {
      const arr = JSON.parse(localStorage.getItem(LOCAL_FAVS_KEY) || "[]");
      const exists = arr.find(
        (x) => x.itemId === payload.itemId && x.userEmail === payload.userEmail
      );
      if (!exists) {
        arr.push({ ...payload, createdAt: new Date().toISOString() });
        localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(arr));
      }
    } catch (e) {
      console.warn("Could not save local favorite:", e);
    }
  }

  // Like: optimistic UI -> server attempts -> local fallback
  async function handleLike() {
    if (!art) return;
    if (liking) return;
    setLiking(true);

    const prevLikes = art.likes || 0;
    const optimisticLikes = prevLikes + 1;
    setArt((p) => ({ ...p, likes: optimisticLikes }));

    try {
      // 1) get canonical item
      let serverItem;
      try {
        const getRes = await fetcher(`/items/${id}`);
        serverItem = getRes?.data ?? getRes ?? art;
      } catch (err) {
        console.log(err)
        saveLocalLikeDelta(art._id);
        Swal.fire(
          "Saved locally",
          "Like saved locally (server unavailable).",
          "info"
        );
        setLiking(false);
        return;
      }

      // 2) try PUT (replace object)
      try {
        await fetcher(`/items/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...serverItem, likes: optimisticLikes }),
        });
        // refresh UI from server if possible
        try {
          const fresh = await fetcher(`/items/${id}`);
          setArt(
            fresh?.data ?? fresh ?? { ...serverItem, likes: optimisticLikes }
          );
        } catch (e) {
          console.log(e)
        }
        Swal.fire("Liked!", "You liked this artwork.", "success");
        setLiking(false);
        return;
      } catch (putErr) {
        console.warn("PUT failed, trying PATCH or other endpoints", putErr);
      }

      // 3) try PATCH (partial)
      try {
        await fetcher(`/items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ likes: optimisticLikes }),
        });
        try {
          const fresh = await fetcher(`/items/${id}`);
          setArt(
            fresh?.data ?? fresh ?? { ...serverItem, likes: optimisticLikes }
          );
        } catch (e) {console.log(e)}
        Swal.fire("Liked!", "You liked this artwork.", "success");
        setLiking(false);
        return;
      } catch (patchErr) {
        console.warn("PATCH failed, will try like endpoint", patchErr);
      }

      // 4) try POST /items/:id/like
      try {
        await fetcher(`/items/${id}/like`, { method: "POST" });
        try {
          const fresh = await fetcher(`/items/${id}`);
          setArt(
            fresh?.data ?? fresh ?? { ...serverItem, likes: optimisticLikes }
          );
        } catch (e) {console.log(e)}
        Swal.fire("Liked!", "You liked this artwork.", "success");
        setLiking(false);
        return;
      } catch (postLikeErr) {
        console.warn("POST like endpoint failed", postLikeErr);
      }

      // 5) all failed -> save local delta
      saveLocalLikeDelta(art._id);
      Swal.fire(
        "Saved locally",
        "Like saved locally (couldn't update server).",
        "info"
      );
    } catch (err) {
      console.error("handleLike unexpected error:", err);
      saveLocalLikeDelta(art._id);
      Swal.fire("Saved locally", "Like saved locally (network error).", "info");
    } finally {
      setLiking(false);
    }
  }

  // Favorite: try server POST -> fallback localStorage
  async function handleFavorite() {
    const user = auth.currentUser;
    if (!user) {
      return Swal.fire("Login Required", "Please login first", "warning");
    }
    if (!art?._id) {
      return Swal.fire("Error", "Invalid item id", "error");
    }
    if (favoriting) return;
    setFavoriting(true);

    const payload = {
      itemId: art._id,
      userEmail: user.email,
      imageUrl: art.imageUrl || art.image,
      title: art.title,
      createdAt: new Date().toISOString(),
    };

    console.log("[handleFavorite] payload:", payload);

    try {
      const res = await fetcher(`/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[handleFavorite] server response:", res);
      Swal.fire("Saved!", "Added to your favorites.", "success");
      setFavoriting(false);

      // dispatch event so other parts of app can update (Favorites page)
      try {
        window.dispatchEvent(
          new CustomEvent("favorite:added", { detail: res?.data ?? payload })
        );
      } catch (e) {
        console.warn("Could not dispatch favorite:added event", e);
      }

      return;
    } catch (err) {
      console.error("[handleFavorite] server error:", err);

      const status = err?.status;
      const body = err?.body;
      if (
        status === 409 ||
        (body &&
          (body.message || body.error || "").toLowerCase().includes("already"))
      ) {
        Swal.fire(
          "Already saved",
          "This item is already in your favorites.",
          "info"
        );
        setFavoriting(false);
        return;
      }

      // fallback: save locally and dispatch event for local flow too
      try {
        saveLocalFavorite(payload);
        Swal.fire("Saved locally", "Favorite saved in your browser.", "info");

        try {
          // dispatch event with payload (no server _id but UI can still refresh)
          window.dispatchEvent(
            new CustomEvent("favorite:added", { detail: payload })
          );
        } catch (e) {
          console.warn("Could not dispatch favorite:added event (local)", e);
        }
      } catch (e) {
        console.error("Fallback local save failed:", e);
        Swal.fire("Error", "Could not save favorite.", "error");
      } finally {
        setFavoriting(false);
      }
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!art) return <div className="p-10 text-center">Not found</div>;

  return (
    <div className="bg-white max-w-3xl mt-3 mx-auto p-6">
      <img
        src={art.imageUrl || art.image}
        alt={art.title}
        className="w-full h-80 object-cover rounded"
      />

      <h2 className="text-3xl text-purple-600 font-semibold mt-4">
        {art.title}
      </h2>
      <p className="text-black mt-2">{art.description}</p>

      <div className="mt-4 text-black">
        <p>
          <strong>Category:</strong> {art.category}
        </p>
        <p>
          <strong>Medium:</strong> {art.medium}
        </p>
        <p>
          <strong>Artist:</strong> {art.artistName}
        </p>
        <p>
          <strong>Likes:</strong> {art.likes || 0}
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleLike}
          className={`px-4 py-2 bg-blue-600 text-white rounded ${
            liking ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={liking}
        >
          Like ({art.likes || 0})
        </button>

        <button
          onClick={handleFavorite}
          className={`px-4 py-2 bg-purple-600 text-white rounded ${
            favoriting ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={favoriting}
        >
          {favoriting ? "Saving..." : "Add to Favorites"}
        </button>
      </div>
    </div>
  );
}
