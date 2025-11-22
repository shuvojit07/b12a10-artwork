// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { fetcher } from "../utils/api";
import ProtectedRoute from "../components/ProtectedRoute";
import useAuth from "../hooks/useAuth";

function AdminContent(){
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(()=>{ load() },[]);

  async function load(){
    setLoading(true);
    try{
      const res = await fetcher("/admin/artworks");
      setArts(res.data || []);
    }catch(e){ console.error(e) }
    setLoading(false);
  }

  if(authLoading) return <div>Loading...</div>;

 
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",");
  if(!user || !adminEmails.includes(user.email)) return <div>Not authorized</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin — Manage Artworks</h2>
      <div className="grid gap-4">
        {arts.map(a => (
          <div key={a._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-600">{a.artistName}</div>
            </div>
            <div>
              <button onClick={async ()=>{ await fetcher(`/admin/artworks/${a._id}`, { method: "DELETE" }); load(); }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage(){
  return <ProtectedRoute><AdminContent/></ProtectedRoute>
}
