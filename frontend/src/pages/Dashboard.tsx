import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLink, deleteLink, getLinks, type LinkResponse } from "../services/links";

export default function Dashboard() {
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchLinks = useCallback(async () => {
    try {
      const data = await getLinks();
      setLinks(data);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const link = await createLink(url, title || undefined);
      setLinks((prev) => [link, ...prev]);
      setUrl("");
      setTitle("");
    } catch {
      setError("URL inválida o error al crear el link");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteLink(id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">LinkSnap</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="font-semibold text-gray-900">Acortar URL</h2>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://url-muy-larga.com/con/muchos/parametros"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título opcional"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creando..." : "Crear link corto"}
          </button>
        </form>

        <div className="flex flex-col gap-3">
          {links.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              Aún no tienes links. ¡Crea el primero!
            </p>
          )}
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium text-blue-600 truncate">
                  {link.short_url}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {link.original_url}
                </span>
                {link.title && (
                  <span className="text-xs text-gray-600">{link.title}</span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-500">
                  {link.total_clicks} clics
                </span>
                <button
                  onClick={() => navigate(`/analytics/${link.id}`)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver analytics
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
