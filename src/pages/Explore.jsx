import { useEffect, useState } from "react";
import ArtCard from "../components/ArtCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetcher } from "../utils/api";

export default function Explore() {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetcher("/items");
        setArts(res.data);
      } catch (err) {
        console.error("Error loading:", err);
      } finally {
        setLoading(false);  // ✔ লোডার সবসময় বন্ধ হবে
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {arts.length > 0 ? (
        arts.map((item) => <ArtCard key={item._id} art={item} />)
      ) : (
        <p className="text-center text-lg">No artworks found.</p>
      )}
    </div>
  );
}
