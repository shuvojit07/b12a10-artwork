import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import AddArtwork from "./pages/AddArtwork";
import MyGallery from "./pages/MyGallery";
import Favorites from "./pages/Favorites";
import ArtworkDetails from "./pages/artworks/ArtworkDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import "./index.css";
import "./app.css";
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-body text">
      <Navbar />
      <main className="container flex-1 mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="/add-artwork"
            element={
              <ProtectedRoute>
                <AddArtwork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-gallery"
            element={
              <ProtectedRoute>
                <MyGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route path="/artworks/:id" element={<ArtworkDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
