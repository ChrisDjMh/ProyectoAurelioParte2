import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Shield, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";

type AdminRole = "administradores" | "contadores";

export function AdminLoginPage() {
  const [role, setRole] = useState<AdminRole>("administradores");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRoleColor = () => role === "administradores" ? "bg-red-600" : "bg-emerald-600";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/auth/${role}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error");

      const normalizedRole = role === "administradores" ? "administrador" : "contador";
      const userData = {
        id: data.usuario.id,
        nombre: data.usuario.nombre,
        email: data.usuario.email,
        role: normalizedRole,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      window.location.href = "/"; // redirige al home
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className={`p-4 ${getRoleColor()} flex items-center gap-3`}>
          {role === "administradores"
            ? <Shield className="w-6 h-6 text-white" />
            : <Calculator className="w-6 h-6 text-white" />}
          <div>
            <p className="text-white font-bold text-lg">Acceso Restringido</p>
            <p className="text-white/70 text-xs">Solo personal autorizado</p>
          </div>
        </div>

        <div className="p-6">
          {/* Selector Admin / Contador */}
          <div className="flex gap-1 mb-5 bg-zinc-100 p-1 rounded-lg">
            {(["administradores", "contadores"] as AdminRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  role === r ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"
                }`}
              >
                {r === "administradores" ? "Administrador" : "Contador"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                required type="email" placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                required type="password" placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-lg ${getRoleColor()} hover:opacity-90 disabled:opacity-50`}
            >
              {loading ? "Verificando..." : "ENTRAR"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}