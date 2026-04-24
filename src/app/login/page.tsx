"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Handle redirection when user state is updated after login
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/policial");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection is handled by useEffect above
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Email ou senha incorretos.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        setError("Erro ao realizar login. Verifique sua conexão.");
      }
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-start">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest group"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Voltar ao Início
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="w-24 h-24 mx-auto mb-4 relative drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
             <Image src="/pf-logo-v3.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">SAGEP LOGIN</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Operational Access</p>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Credencial (Email)</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">alternate_email</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="exemplo@pf.gov.br"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-blue-600 text-on-primary font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">login</span>
                  ENTRAR NO SISTEMA
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
              Acesso restrito ao pessoal autorizado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
