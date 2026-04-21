import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User as UserIcon, Building, Shield, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";


interface LoginRegisterModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}


const ALLOWED_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com"];
const isValidEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

type UserRole = "usuarios" | "organizadores"; 

export function LoginRegisterModal({ onClose, onLoginSuccess }: LoginRegisterModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("usuarios");
  const [loginSuccess, setLoginSuccess] = useState(false); 

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    negocio: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [emailError, setEmailError] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setError("");
    setSuccessMsg("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setFormData({ ...formData, email: val });

  if (val.includes("@") && val.split("@")[1]?.length > 0) {
    setEmailError(!isValidEmail(val));
  } else {
    setEmailError(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");


  if (!isValidEmail(formData.email)) {
    return setError("Solo se permiten correos de Gmail, Outlook o Hotmail");
  }

  if (!isLogin && formData.password !== formData.confirmPassword) {
    return setError("Las contraseñas no coinciden");
  }
    setLoading(true);
    try {
      const action = isLogin ? "login" : "registro";
      const url = `http://localhost:3001/api/auth/${userRole}/${action}`;



      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { email: formData.email, password: formData.password }
            : formData
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error en la solicitud");
      }

      if (isLogin) {
        const userFromDB = data.usuario;

        const normalizedRole =
          userRole === "usuarios" ? "usuario" :
          "organizador" 
          ;

        const userData = {
          id: userFromDB.id,
          nombre: userFromDB.nombre,
          email: userFromDB.email,
          role: normalizedRole,
          tipo: userFromDB.tipo || "Normal",
        };

        localStorage.setItem("user", JSON.stringify(userData));


        setLoginSuccess(true);


        setTimeout(() => {
          onLoginSuccess(userData);

        }, 1200);

      } else {
        setSuccessMsg(
        userRole === "organizadores"
          ? "¡Solicitud enviada! Un administrador revisará tu registro. Te contactaremos pronto."
          : "¡Registro exitoso! Ya puedes iniciar sesión."
);
        setIsLogin(true);
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case "organizadores": return <Building className="w-6 h-6 text-white" />;
      default: return <UserIcon className="w-6 h-6 text-white" />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "organizadores": return "bg-blue-600";
      default: return "bg-black";
    }
  };

  const getRoleName = () => {
    switch (userRole) {
      case "organizadores": return "Organizador";
      default: return "Usuario";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full bg-white relative rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence>
            {loginSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${getRoleColor()}`}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-center"
                >
                  <p className="text-xl font-bold text-black">¡Bienvenido!</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Sesión iniciada como <span className="font-semibold">{getRoleName()}</span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${getRoleColor()}`}>
                {getRoleIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </h2>
                <p className="text-sm text-zinc-500">{getRoleName()}</p>
              </div>
            </div>

            <div className="flex gap-1 mb-6 bg-zinc-100 p-1 rounded-lg">
              {(["usuarios", "organizadores"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`flex-1 px-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                    userRole === role
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-500 hover:text-black"
                  }`}
                >
              {role === "usuarios"       ? "Usuario"      :
                  "Organizador"  }
              </button>
              ))}
            </div>

           

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && userRole === "organizadores" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 ml-1">Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      required name="negocio" value={formData.negocio} onChange={handleChange}
                      type="text" placeholder="Nombre de tu negocio"
                      className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 ml-1">Nombre</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      required name="nombre" value={formData.nombre} onChange={handleChange}
                      type="text" placeholder="Tu nombre"
                      className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
              {!isLogin && userRole === "organizadores" && (
  <div>
    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 ml-1">Teléfono</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">📞</span>
      <input
        required
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        type="tel"
        placeholder="+52 664 000 0000"
        className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
      />
    </div>
  </div>
)}

              <div>
  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 ml-1">Email</label>
  <div className="relative">
    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
      emailError ? "text-red-400" : "text-zinc-400"
    }`} />
    <input
      required
      name="email"
      value={formData.email}
      onChange={handleEmailChange} 
      type="email"
      placeholder="ejemplo@gmail.com"
      className={`w-full pl-11 pr-4 py-3 border focus:outline-none rounded-lg text-sm transition-colors ${
        emailError
          ? "border-red-400 bg-red-50 focus:border-red-500"
          : "border-zinc-200 focus:border-black"
      }`}
    />
  </div>
  <AnimatePresence>
    {emailError && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"
      >
        <AlertCircle className="w-3 h-3" />
        Solo Gmail, Outlook o Hotmail
      </motion.p>
    )}
  </AnimatePresence>
</div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    required name="password" value={formData.password} onChange={handleChange}
                    type="password" placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 ml-1">Confirmar</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      type="password" placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 border border-zinc-200 focus:border-black focus:outline-none rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold transition-all rounded-lg disabled:opacity-50 mt-2 shadow-lg ${getRoleColor()} hover:opacity-90`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Verificando...
                  </span>
                ) : isLogin ? "ENTRAR" : "REGISTRARME"}
              </button>
            </form>

            {(userRole === "usuarios" || userRole === "organizadores") && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-sm text-zinc-500 hover:text-black transition-colors"
                >
                  {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                  <span className="font-bold underline">
                    {isLogin ? "Regístrate" : "Inicia Sesión"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}