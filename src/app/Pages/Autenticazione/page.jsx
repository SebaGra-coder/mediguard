'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function AuthContent({ onLogin }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    surname: "",
    confirmPassword: "",
    dob: "",
  }); 

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsLogin(mode !== "register");
  }, [searchParams]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Errore: Le password non coincidono");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- LOGIN ---
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await res.json();

        if (res.ok) {
          if (onLogin) onLogin();
          // Redirect alla HomePage o dove preferisci
          window.location.href = "/Pages/HomePage";
        } else {
          alert(data.message || "Errore durante il login");
        }

      } else {
        // --- REGISTRAZIONE ---
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            nome: formData.name,       // Nota: il backend aspetta 'nome', nel form è 'name'
            cognome: formData.surname, // Nota: il backend aspetta 'cognome', nel form è 'surname'
            data_nascita: formData.dob // Nota: il backend aspetta 'data_nascita', nel form è 'dob'
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Registrazione completata! Ora puoi accedere.");
          setIsLogin(true); // Passa alla modalità login
        } else {
          alert(data.message || "Errore durante la registrazione");
        }
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Si è verificato un errore di comunicazione con il server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // -- COLORS --
  const primaryColor = "text-[#14b8a6]";
  const bgPrimary = "bg-[#14b8a6]";
  const bgPrimaryHover = "hover:bg-[#0d9488]";
  const focusRing = "focus:ring-[#14b8a6]";

  // -- ICONS --
  const Icons = {
    ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
    Pill: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
    User: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
    EyeOff: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900">
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <Link 
          href="Ricerca"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors font-medium text-sm"
        >
          <Icons.ArrowLeft />
          Torna alla home
        </Link>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-0 animate-scale-in">
          
          {/* Card Header */}
          <div className="text-center pt-8 px-6 pb-2">
            {/* Logo */}
            <div className={`mx-auto w-16 h-16 rounded-2xl ${bgPrimary} flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4 text-white`}>
              <Icons.Pill />
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {isLogin ? "Bentornato" : "Crea il tuo account"}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin 
                ? "Accedi per gestire i tuoi farmaci" 
                : "Inizia a gestire i tuoi farmaci in modo intelligente"
              }
            </p>
          </div>

          {/* Card Content */}
          <div className="p-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Nome
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.User />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Mario"
                        className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${focusRing} focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="surname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Cognome
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.User />
                      </div>
                      <input
                        id="surname"
                        name="surname"
                        type="text"
                        placeholder="Rossi"
                        className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${focusRing} focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                        value={formData.surname}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dob" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Data di Nascita
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.Calendar />
                      </div>
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${focusRing} focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                        value={formData.dob}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Mail />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mario@esempio.it"
                    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${focusRing} focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Lock />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${focusRing} focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword"
                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Conferma password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Lock />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${focusRing} focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className={`text-sm font-medium ${primaryColor} hover:underline`}>
                    Password dimenticata?
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full inline-flex items-center justify-center h-11 rounded-md px-8 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${bgPrimary} ${bgPrimaryHover} shadow-md`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isLogin ? "Accesso in corso..." : "Registrazione..."}
                  </span>
                ) : (
                  isLogin ? "Accedi" : "Crea account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500">
                {isLogin ? "Non hai un account?" : "Hai già un account?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={`font-bold ${primaryColor} hover:underline`}
              >
                {isLogin ? "Registrati" : "Accedi"}
              </button>
            </div>

            {!isLogin && (
              <p className="mt-6 text-xs text-center text-slate-400 leading-relaxed">
                Registrandoti accetti i nostri{" "}
                <a href="#" className={`${primaryColor} hover:underline`}>Termini di Servizio</a>
                {" "}e la{" "}
                <a href="#" className={`${primaryColor} hover:underline`}>Privacy Policy</a>.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Animation Style */}
      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function Auth(props) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div></div>}>
      <AuthContent {...props} />
    </Suspense>
  );
}