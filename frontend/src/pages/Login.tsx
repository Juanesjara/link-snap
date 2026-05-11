import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = isRegister
        ? await register(email, password)
        : await login(email, password);

      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError("No se puede conectar al servidor. ¿Está el backend corriendo?");
      } else {
        setError("Credenciales inválidas o email ya registrado");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">LinkSnap</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Cargando..." : isRegister ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}
