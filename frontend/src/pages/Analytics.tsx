import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getLinkAnalytics, type LinkAnalytics } from "../services/links";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<LinkAnalytics | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!id) return;
    getLinkAnalytics(Number(id), days)
      .then(setData)
      .catch(() => navigate("/dashboard"));
  }, [id, days, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Cargando analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Volver
        </button>
        <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-500">Total de clics</p>
          <p className="text-5xl font-bold text-blue-600 mt-1">{data.total_clicks}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Clics por día</h2>
          {data.clicks_per_day.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos en este período</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.clicks_per_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Dispositivos</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.by_device} dataKey="clicks" nameKey="label" cx="50%" cy="50%" outerRadius={70} label={({ name }) => String(name ?? "")}>
                  {data.by_device.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Browsers</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.by_browser} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.by_referrer.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Referrers</h2>
            <div className="flex flex-col gap-2">
              {data.by_referrer.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate">{item.label}</span>
                  <span className="text-gray-900 font-medium shrink-0 ml-4">{item.clicks}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
