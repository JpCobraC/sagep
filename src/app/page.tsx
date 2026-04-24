"use client";

import Link from "next/link";
import Image from "next/image";

export default function EntryPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden font-body text-on-surface">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(rgba(45, 100, 245, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 100, 245, 0.2) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Floating HUD Elements */}
      <div className="absolute top-10 left-10 hidden lg:block opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">SYSTEM_STATUS</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase font-bold">Encrypted_Network_Active</span>
          </div>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-12">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="w-24 h-24 relative animate-in fade-in zoom-in duration-1000">
               <Image 
                 src="/pf-logo-v3.png" 
                 alt="Polícia Federal Logo" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <div className="text-left">
              <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                SAGEP
              </h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1 pl-1">Operational Command</p>
            </div>
          </div>
          <p className="text-slate-500 max-w-lg mx-auto text-sm font-medium tracking-tight leading-relaxed">
            Sistema Avançado de Gestão de Escalas de Policiais. Automação inteligente orientada a mérito e prontidão tática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Admin Entry Node */}
          <Link href="/login/admin" className="group">
            <div className="relative h-full bg-surface-container/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
               <div className="absolute -right-12 -bottom-12 p-10 opacity-5 transition-all duration-700">
                 <span className="material-symbols-outlined text-[180px] text-white">shield_person</span>
               </div>
               <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                   <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">CENTRO DE OPERAÇÕES</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Gestão de Efetivo, Viagens e<br/>Ranking de Meritocracia</p>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   Acessar CORE_CMD
                   <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </div>
               </div>
            </div>
          </Link>

          {/* Policial Entry Node */}
          <Link href="/login/policial" className="group">
            <div className="relative h-full bg-surface-container/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] transition-all duration-500 hover:border-tertiary/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
               <div className="absolute -right-12 -bottom-12 p-10 opacity-5 transition-all duration-700">
                 <span className="material-symbols-outlined text-[180px] text-white">smartphone</span>
               </div>
               <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary-container transition-all duration-500">
                   <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>badges</span>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">PORTAL DO OFICIAL</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Consultar Escalas, Receber Ciência<br/>e Status de Meritocracia</p>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   Acessar HUD_TÁTICO
                   <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </div>
               </div>
            </div>
          </Link>
        </div>

        {/* Global Footer Security Label */}
        <div className="pt-12 flex flex-col items-center gap-4">
          <div className="w-1 h-12 bg-gradient-to-b from-primary/50 to-transparent"></div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] italic">
            SECURE_CONNECTION_AUTHORIZED // COMMAND_ACCESS_V_1.0
          </p>
        </div>
      </main>
    </div>
  );
}
