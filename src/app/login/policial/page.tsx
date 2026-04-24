"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function PolicialLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading && user.role === 'policial') {
      router.push("/policial");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Credenciais operacionais inválidas.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors text-[10px] font-black uppercase tracking-widest group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Voltar ao Início
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto mb-4 relative drop-shadow-[0_0_15px_rgba(217,119,6,0.3)]">
             <Image src="/pf-logo-v3.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">SAGEP OPERACIONAL</h1>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Hub do Policial</p>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-amber-500/10 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Funcional</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all"
                placeholder="nome.sobrenome@pf.gov.br"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all"
                placeholder="••••••••"
                required
              />
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
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "ACESSAR MEU PORTAL"
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Novo por aqui?</p>
            <Link 
              href="/register/policial" 
              className="text-xs font-black text-amber-500 hover:text-amber-400 transition-colors uppercase italic"
            >
              Ativar Primeiro Acesso Operacional
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
