import { Link } from "react-router-dom";

export default function ArtCard({ art }) {
  const title = art.title || art.name || "Untitled";
  const image = art.imageUrl || art.img || "/placeholder-art.jpg";
  const artist = art.userName || art.artistName || "Unknown Artist";
  return (
    <div className="bg-white shadow rounded overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-gray-100">
        <img
          src={image}
          className="w-full h-full object-cover"
          alt={title}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-art.jpg";
          }}
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-purple-700 text-lg">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {art.category || "Uncategorized"}
        </p>
        <p className="text-sm text-gray-500">Artist: {artist}</p>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">❤️ {art.likes || 0}</span>
          <Link
            to={`/artworks/${art._id}`}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
