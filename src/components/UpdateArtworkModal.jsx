// src/components/UpdateArtworkModal.jsx
import ArtworkForm from "./ArtworkForm";

export default function UpdateArtworkModal({ art, onClose, onUpdated }) {
  if (!art) return null;

  // onSaved passed to ArtworkForm — after successful update it triggers onUpdated and closes modal
  function handleSaved() {
    onUpdated && onUpdated();
    onClose && onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Update Artwork</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        {/* reuse ArtworkForm in "edit mode" by passing artwork prop */}
        <ArtworkForm artwork={art} onSaved={handleSaved} />
      </div>
    </div>
  );
}
