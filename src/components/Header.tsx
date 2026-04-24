"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [lang, setLang] = useState<"pt" | "en">("pt");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLang = () => {
    setLang(prev => prev === "pt" ? "en" : "pt");
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-surface/40 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-white/5 font-sans text-sm">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Logo */}
        <div className="w-8 h-8 relative md:hidden flex-shrink-0">
          <Image src="/pf-logo-v3.png" alt="PF Logo" fill className="object-contain" />
        </div>

        <div className="bg-surface-container-lowest/50 rounded-full px-4 py-1.5 flex items-center gap-3 w-full max-w-md group border border-white/5 focus-within:border-primary/50 transition-all">
          <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full placeholder:text-slate-500 outline-none"
            placeholder="Pesquisar registro operacional..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link href="/admin/relatorios" className="text-slate-300 hover:text-primary transition-colors scale-95 duration-150 relative" title="Notificações e Logs">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-surface"></span>
          </Link>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="text-slate-300 hover:text-primary transition-colors scale-95 duration-150 flex items-center gap-1.5 relative group"
            title={lang === "pt" ? "Mudar para Inglês" : "Switch to Portuguese"}
          >
            <span className="material-symbols-outlined">g_translate</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
              {lang === "pt" ? "PT" : "EN"}
            </span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/10"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{user?.nome || "Carregando..."}</p>
              <p className="text-[10px] text-slate-500 JetBrains_Mono_for_data uppercase">{user?.role === 'admin' ? 'Administrador' : 'Policial'}</p>
            </span>
            <div className={`w-10 h-10 rounded-full bg-surface-container-highest border-2 p-0.5 transition-all overflow-hidden ${showUserMenu ? 'border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-primary/20 group-hover:border-primary/50'}`}>
              <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary">account_circle</span>
              </div>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-14 w-72 bg-surface-container-highest/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* User Info */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-2xl">shield_person</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{user?.nome || "Carregando..."}</p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{user?.email}</p>
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block border border-primary/20">
                      {user?.role === 'admin' ? 'Admin' : 'Operacional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  href="/admin/configs"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-primary transition-colors">settings</span>
                  <div>
                    <p className="text-xs font-bold">Configurações</p>
                    <p className="text-[10px] text-slate-600">Preferências do sistema</p>
                  </div>
                </Link>
                <Link
                  href="/admin/relatorios"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-primary transition-colors">analytics</span>
                  <div>
                    <p className="text-xs font-bold">Relatórios</p>
                    <p className="text-[10px] text-slate-600">Central de inteligência</p>
                  </div>
                </Link>
                <Link
                  href="/admin/policiais"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-primary transition-colors">groups</span>
                  <div>
                    <p className="text-xs font-bold">Gestão de Efetivo</p>
                    <p className="text-[10px] text-slate-600">Cadastro e disponibilidade</p>
                  </div>
                </Link>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all group"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span className="text-xs font-bold">Encerrar Sessão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
