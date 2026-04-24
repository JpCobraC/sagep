"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Autenticando...</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 bg-surface-container/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-red-500/10 shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
            <span className="material-symbols-outlined text-4xl">lock_person</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Acesso Negado</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Esta área é restrita ao Comando Operacional.<br/>Seu UID não possui permissão de administrador.
            </p>
            {user && (
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 break-all">
                UID: {user.uid}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.href = "/"}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
            >
              Voltar ao Início
            </button>
            <button 
              onClick={() => signOut()}
              className="w-full py-4 text-red-400 font-black uppercase tracking-widest text-[10px] hover:underline"
            >
              Trocar de Usuário
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-32 md:pt-32 bg-surface-container/20">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-surface/80 backdrop-blur-md flex justify-around items-center px-6 pb-4 pt-2 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl p-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Feed</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 p-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">schedule</span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Troca</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 p-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">shield</span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Missão</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 p-2 active:scale-90 transition-transform relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Alertas</span>
        </button>
      </nav>
    </div>
  );
}
