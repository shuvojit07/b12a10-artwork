import { useEffect, useState } from "react";
import ArtCard from "../components/ArtCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetcher } from "../utils/api";

export default function Explore() {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  // Load artworks (with optional category filter)
  async function loadItems(selectedCategory = "all") {
    setLoading(true);

    try {
      let endpoint = "/items";

      // category filter apply
      if (selectedCategory !== "all") {
        endpoint = `/items?category=${encodeURIComponent(selectedCategory)}`;
      }

      const res = await fetcher(endpoint);
      setArts(res.data || []);
    } catch (err) {
      console.error("Error loading:", err);
    } finally {
      setLoading(false);
    }
  }

  // First load
  useEffect(() => {
    loadItems();
  }, []);

  // When category changes → reload items
  useEffect(() => {
    loadItems(category);
  }, [category]);

  return (
    <div className="p-6">
      {/* Filter Section */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Explore Artworks</h2>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white shadow-sm"
        >
          <option value="all">All Categories</option>
          <option value="Painting">Painting</option>
          <option value="Drawing">Drawing</option>
          <option value="Digital">Digital Art</option>
          <option value="Photography">Photography</option>
          <option value="Illustration">Illustration</option>
          <option value="3D">3D Art</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : arts.length > 0 ? (
        /* Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arts.map((item) => (
            <ArtCard key={item._id} art={item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-lg">No artworks found.</p>
      )}
    </div>
  );
}
