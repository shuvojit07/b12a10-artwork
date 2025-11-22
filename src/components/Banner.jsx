// src/components/Banner.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Professional Banner:
 * - Loads images + optional title/subtitle from API
 * - Shows a readable, responsive text overlay with subtle animation
 * - Includes optional CTA button (can link to artwork or collection)
 * - Handles different API shapes (array, {items:[]}, {data:[]}, single object)
 *
 * Usage:
 * <Banner apiUrl="http://localhost:4000/items" cta={{ text: "Explore", to: "/gallery" }} />
 */

export default function Banner({
  apiUrl = "http://localhost:4000/items",
  interval = 4000,
  cta = { text: "Explore", to: "/gallery" }, // pass null to hide CTA
}) {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch slides (robust to different response shapes)
  useEffect(() => {
    const controller = new AbortController();
    async function loadSlides() {
      try {
        setLoading(true);
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data.items)) arr = data.items;
        else if (Array.isArray(data.data)) arr = data.data;
        else if (data && typeof data === "object") {
          // if data has nested array under result or docs (common patterns)
          if (Array.isArray(data.result)) arr = data.result;
          else if (Array.isArray(data.docs)) arr = data.docs;
          else arr = [data];
        }

        // Map to expected structure: { id, img, title, subtitle, link }
        const formatted = arr
          .map((it) => ({
            id: it._id || it.id || `${Date.now()}_${Math.random()}`,
            img: it.imageUrl || it.img || it.image || it.photo || "/placeholder-banner.jpg",
            title: it.title || it.name || it.heading || "",
            subtitle: it.subtitle || it.text || it.description || "",
            link: it.link || it.url || (it._id ? `/artworks/${it._id}` : null),
          }))
          // filter out items without any image (optional)
          .filter(Boolean);

        setSlides(formatted.length ? formatted : [
          { id: "fallback", img: "/placeholder-banner.jpg", title: "Welcome", subtitle: "" }
        ]);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Banner loading error:", err);
          setSlides([{ id: "error", img: "/placeholder-banner.jpg", title: "Could not load banner", subtitle: "" }]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadSlides();
    return () => controller.abort();
  }, [apiUrl]);

  // auto-advance
  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setIndex((p) => (slides.length ? (p + 1) % slides.length : 0));
    }, interval);
    return () => clearInterval(timer);
  }, [slides, interval]);

  // keyboard navigation (left/right) for accessibility
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") setIndex((p) => (p - 1 + slides.length) % slides.length);
      if (e.key === "ArrowRight") setIndex((p) => (p + 1) % slides.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured artwork"
      className="relative w-full h-[320px] md:h-[480px] overflow-hidden rounded-lg shadow"
    >
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {/* Slides */}
      {slides.map((s, i) => (
        <article
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          {/* background image */}
          <img
            src={s.img}
            alt={s.title || `Slide ${i + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "/placeholder-banner.jpg"; }}
          />

          {/* gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

          {/* text container (center-left on large screens) */}
          <div className="absolute left-4 right-4 bottom-6 md:bottom-12 md:left-12 md:right-auto max-w-2xl">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-5">
              {/* Title */}
              {s.title && (
                <h2 className="text-white text-xl md:text-3xl font-semibold leading-tight drop-shadow-sm">
                  {s.title}
                </h2>
              )}

              {/* Subtitle */}
              {s.subtitle && (
                <p className="mt-1 text-sm md:text-base text-gray-200 max-w-prose">
                  {s.subtitle}
                </p>
              )}

              {/* CTA */}
              {cta && (
                <div className="mt-3">
                  {s.link ? (
                    <Link
                      to={s.link}
                      className="inline-block px-4 py-2 bg-white text-black rounded-md text-sm font-medium shadow-sm hover:shadow-lg transition"
                    >
                      {cta.text}
                    </Link>
                  ) : (
                    <Link
                      to={cta.to || "/"}
                      className="inline-block px-4 py-2 bg-white text-black rounded-md text-sm font-medium shadow-sm hover:shadow-lg transition"
                    >
                      {cta.text}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}

      {/* navigation dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-3 h-3 rounded-full ring-1 ring-white/40 ${
                index === i ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* prev/next buttons (small, accessible) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full z-20 hover:bg-black/60 transition"
          >
            ‹
          </button>
          <button
            onClick={() => setIndex((p) => (p + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full z-20 hover:bg-black/60 transition"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
