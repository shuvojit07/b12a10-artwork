// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Artify</h3>
            <p className="mt-2 text-sm text-gray-400">
              Where imagination meets creativity. Discover, create & share
              artworks freely.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>Home</li>
              <li>Explore</li>
              <li>Add Artwork</li>
              <li>My Gallery</li>
              <li>Favorites</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <p className="text-sm text-gray-400">Email: shuvojittikader@gmail.com</p>
            <p className="text-sm text-gray-400">Phone: +880 1581866550</p>

           
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6 border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} Artify — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
