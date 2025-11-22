// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import Banner from "../components/Banner";
import ArtCard from "../components/ArtCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetcher } from "../utils/api";
import Swal from "sweetalert2";

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((s) => s[0] || "")
      .slice(0, 2)
      .join("") || "A"
  ).toUpperCase();
}

function formatCount(n) {
  if (n === null || n === undefined) return "0";
  if (typeof n !== "number") n = Number(n) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

export default function Home() {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetcher("/items");
        const list = res?.data || [];
        const normalized = list.map((it) => ({
          ...it,
          // convert createdAt once
          createdAt: it.createdAt ? new Date(it.createdAt) : new Date(0),
          likes:
            typeof it.likes === "number" ? it.likes : Number(it.likes) || 0,
        }));
        if (!mounted) return;
        // sort newest first
        normalized.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setArts(normalized);
      } catch (e) {
        console.error("Failed loading artworks", e);
        Swal.fire("Error", "Could not load artworks", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Top artists of the week (last 7 days) by total likes on their artworks
  const topArtists = useMemo(() => {
    if (!arts || arts.length === 0) return [];
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = arts.filter((a) => a.createdAt.getTime() >= oneWeekAgo);
    const map = new Map();
    for (const a of recent) {
      const name = a.artistName || "Unknown Artist";
      const entry = map.get(name) || {
        artistName: name,
        count: 0,
        likes: 0,
        sampleImage: a.imageUrl || a.image || "",
      };
      entry.count += 1;
      entry.likes += a.likes || 0;
      if (!entry.sampleImage && (a.imageUrl || a.image))
        entry.sampleImage = a.imageUrl || a.image;
      map.set(name, entry);
    }
    return Array.from(map.values())
      .sort((x, y) => y.likes - x.likes)
      .slice(0, 6);
  }, [arts]);

  // Community highlights: top 3 artworks in last 14 days by likes
  const communityHighlights = useMemo(() => {
    if (!arts || arts.length === 0) return [];
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return arts
      .filter((a) => a.createdAt.getTime() >= twoWeeksAgo)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 3);
  }, [arts]);

  return (
    <div className="space-y-10">
      <Banner />

      {/* Featured Artworks */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold">Featured Artworks</h3>
          <a href="/gallery" className="text-sm text-purple-600 hover:underline">
            View all
          </a>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : arts.length === 0 ? (
          <div className="py-12 text-center text-gray-600">No artworks yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {arts.slice(0, 6).map((a) => (
              <div key={a._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <ArtCard art={a} large />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Artists */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold">Top Artists of the Week</h3>
            <p className="text-sm text-gray-500">Based on recent artworks & likes</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/artists" className="text-sm text-gray-600 hover:underline">Explore artists</a>
            <a href="/submit" className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">Submit your art</a>
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : topArtists.length === 0 ? (
          <div className="py-8 text-center text-gray-600">No activity this week. Be the first to share!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {topArtists.map((artist, idx) => (
              <div key={artist.artistName + idx} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center transform hover:-translate-y-1 transition">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-semibold mb-3 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                  {artist.sampleImage ? (
                    <img src={artist.sampleImage} alt={artist.artistName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white">{initials(artist.artistName)}</span>
                  )}
                </div>

                <div className="font-semibold text-gray-900">{artist.artistName}</div>
                <div className="text-sm text-gray-500 mt-1">{artist.count} artworks</div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="px-2 py-1 bg-purple-50 rounded text-purple-700 font-semibold">{formatCount(artist.likes)}</div>
                  <div className="text-xs text-gray-400">likes</div>
                </div>

                <div className="mt-4 w-full">
                  <button
                    onClick={() => (window.location.href = `/search?artist=${encodeURIComponent(artist.artistName)}`)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
                  >
                    View profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Community Highlights */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold">Community Highlights</h3>
            <p className="text-sm text-gray-500">Top picks from the community (last 14 days)</p>
          </div>
          <div>
            <a href="/community" className="text-sm text-gray-600 hover:underline">See all highlights</a>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : communityHighlights.length === 0 ? (
          <div className="py-8 text-center text-gray-600">No highlights yet — share your favorite piece!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityHighlights.map((a) => (
              <div key={a._id} className="relative rounded-xl overflow-hidden shadow-lg bg-black">
                <img src={a.imageUrl || a.image} alt={a.title || "Artwork"} className="w-full h-72 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                  <div className="text-white text-lg font-semibold">{a.title || "Untitled"}</div>
                  <div className="text-sm text-gray-200 mt-1">by {a.artistName || "Unknown"}</div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => (window.location.href = `/items/${encodeURIComponent(a._id)}`)}
                      className="px-3 py-2 bg-white text-purple-700 rounded-md font-medium hover:opacity-90"
                    >
                      View
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const payload = {
                            itemId: a._id,
                            userEmail: (window.__CURRENT_USER__ && window.__CURRENT_USER__.email) || "",
                            imageUrl: a.imageUrl || a.image || "",
                            title: a.title || "",
                            createdAt: new Date().toISOString(),
                          };
                          await fetcher("/favorites", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          Swal.fire("Saved", "Added to your favorites", "success");
                        } catch (err) {
                          console.error("Save favorite failed", err);
                          Swal.fire("Error", "Could not save favorite", "error");
                        }
                      }}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700"
                    >
                      Save
                    </button>

                    <div className="ml-auto text-sm text-gray-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.538 1.118L10 13.347l-3.41 2.677c-.783.57-1.838-.197-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.607 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                      </svg>
                      <span>{formatCount(a.likes || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
