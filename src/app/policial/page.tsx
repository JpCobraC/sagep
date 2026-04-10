"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { format, isAfter, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Policial, Viagem, Sobreaviso } from "@/types";
import { 
  subscribePoliciais, 
  subscribeViagens, 
  subscribeSobreaviso, 
  confirmSobreaviso, 
  confirmViagem 
} from "@/lib/firestore";

export default function PolicialPage() {
  const [currentUser, setCurrentUser] = useState<Policial | null>(null);
  const [policiais, setPoliciais] = useState<Policial[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [sobreavisos, setSobreavisos] = useState<Sobreaviso[]>([]);
  
  // For demo purposes, we allow switching user in the UI if no "auth" exists
  const [mockUserId, setMockUserId] = useState<string>("policial_demo_1");

  useEffect(() => {
    const unsubPoliciais = subscribePoliciais((data) => {
      setPoliciais(data);
      const user = data.find(p => p.id === mockUserId);
      if (user) setCurrentUser(user);
    });

    const unsubViagens = subscribeViagens(setViagens);
    const unsubSobreaviso = subscribeSobreaviso(setSobreavisos);

    return () => {
      unsubPoliciais();
      unsubViagens();
      unsubSobreaviso();
    };
  }, [mockUserId]);

  // Filter scales for this officer
  const myViagens = useMemo(() => viagens.filter(v => v.policial_designado === mockUserId), [viagens, mockUserId]);
  const mySobreavisos = useMemo(() => sobreavisos.filter(s => s.policial_designado === mockUserId), [sobreavisos, mockUserId]);

  // Find next upcoming scale (either voyage or on-call)
  const nextScale = useMemo(() => {
    const combined = [
      ...myViagens.map(v => ({ ...v, type: 'viagem' as const, date: new Date(v.data_inicio) })),
      ...mySobreavisos.map(s => ({ ...s, type: 'sobreaviso' as const, date: new Date(s.data) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return combined.find(scale => isAfter(scale.date, new Date()) || isSameDay(scale.date, new Date()));
  }, [myViagens, mySobreavisos]);

  const handleConfirm = async () => {
    if (!nextScale) return;
    if (nextScale.type === 'sobreaviso') {
      await confirmSobreaviso(nextScale.id, mockUserId);
    } else {
      await confirmViagem(nextScale.id, mockUserId, (nextScale as Viagem).pontos);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* TopNavBar HUD */}
      <header className="fixed top-0 right-0 w-full z-40 bg-surface-container/40 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
             <Image 
               src="/pf-logo.png" 
               alt="PF Logo" 
               fill 
               className="object-contain"
               priority
             />
          </div>
          <span className="text-lg font-black tracking-tighter text-white uppercase italic">SAGEP</span>
        </div>
        
        {/* User Switcher (for demo/development) */}
        <select 
          value={mockUserId}
          onChange={(e) => setMockUserId(e.target.value)}
          className="bg-transparent border-none text-[10px] uppercase font-black tracking-widest text-primary cursor-pointer outline-none"
        >
          {policiais.map(p => (
            <option key={p.id} value={p.id} className="bg-surface">{p.nome}</option>
          ))}
        </select>

        <div className="flex items-center gap-4 text-slate-300">
          <button className="relative">
            <span className="material-symbols-outlined hover:text-primary transition-colors cursor-pointer">notifications</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary-container rounded-full shadow-[0_0_10px_rgba(var(--secondary-container-rgb),0.5)] border-2 border-surface"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">person</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-28 px-6 max-w-lg mx-auto space-y-8">
        {/* Welcome Section */}
        <section className="space-y-1">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">Bem vindo, {currentUser?.nome || "Carregando..."}</p>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">HUB OPERACIONAL</h1>
        </section>

        {/* PRÓXIMA ESCALA CARD */}
        {nextScale ? (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-surface-container/60 backdrop-blur-xl border-l-8 border-primary shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 italic">Ação Imediata</h2>
                <p className="text-4xl font-black text-white tracking-tighter leading-none">
                  {format(nextScale.date, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {nextScale.type === 'viagem' ? 'flight_takeoff' : 'event_available'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Atividade</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-tertiary">military_tech</span>
                  <p className="text-sm font-black text-white uppercase italic">
                    {nextScale.type === 'viagem' ? (nextScale as Viagem).destino : 'Sobreaviso Tático'}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Janela</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-tertiary">schedule</span>
                  <p className="text-sm font-black text-white font-mono">
                    {nextScale.type === 'sobreaviso' 
                      ? `${format(new Date((nextScale as Sobreaviso).horario_inicio), "HH:mm")} - ${format(new Date((nextScale as Sobreaviso).horario_fim), "HH:mm")}`
                      : "Duração Missão"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unidade/Setor</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gps_fixed</span>
                <p className="text-sm font-bold text-slate-200">Setor Operacional Regional - Centro</p>
              </div>
            </div>

            {/* Action Logic */}
            {nextScale.status === 'pendente' ? (
              <button 
                onClick={handleConfirm}
                className="w-full bg-primary hover:bg-blue-600 text-on-primary font-black py-6 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-primary/30"
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                DAR CIÊNCIA NA ESCALA
              </button>
            ) : (
              <div className="w-full bg-tertiary/10 border border-tertiary/30 text-tertiary font-black py-6 rounded-2xl flex items-center justify-center gap-4">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                CIÊNCIA CONFIRMADA
              </div>
            )}
          </section>
        ) : (
          <div className="bg-surface-container-low rounded-3xl p-10 text-center space-y-4 border border-white/5 opacity-50">
            <span className="material-symbols-outlined text-5xl">event_busy</span>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Nenhuma escala pendente no radar.</p>
          </div>
        )}

        {/* Histórico & Registros */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">LOG OPERACIONAL</h3>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest cursor-pointer hover:underline underline-offset-8 transition-all">Sincronizar</span>
          </div>
          <div className="space-y-4">
            {[...myViagens, ...mySobreavisos]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((rec, i) => (
                <div key={i} className="bg-surface-container-high/40 p-5 rounded-3xl flex items-center gap-5 transition-all hover:bg-surface-container-highest border border-white/5 group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold transition-transform group-hover:rotate-6 ${
                    rec.status === 'confirmado' ? "bg-tertiary/5 border-tertiary/10 text-tertiary" : "bg-primary/5 border-primary/10 text-primary"
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {(rec as any).destino ? 'flight_takeoff' : 'history'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-extrabold text-white text-sm uppercase italic">
                        {(rec as any).destino ? `Missão: ${(rec as any).destino}` : 'Escala de Sobreaviso'}
                      </h4>
                      <span className="text-[9px] font-black text-slate-500 font-mono">
                        {format(new Date(rec.created_at), "dd/MM/yy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                        rec.status === 'confirmado' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                      }`}>
                         {rec.status}
                      </span>
                      {(rec as any).pontos > 0 && (
                        <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">+{ (rec as any).pontos } PTS</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Tactical Footer Metrics */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container p-6 rounded-3xl border border-white/5">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Mérito</p>
             <p className="text-3xl font-black text-white JetBrains_Mono_for_data">{currentUser?.pontos_acumulados_viagem || 0}</p>
          </div>
          <div className="bg-surface-container p-6 rounded-3xl border border-white/5">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dias Plantão</p>
             <p className="text-3xl font-black text-white JetBrains_Mono_for_data">{currentUser?.dias_acumulados_sobreaviso || 0}</p>
          </div>
        </section>
      </main>

      {/* BottomNavBar HUD (Mobile Only) */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-3xl bg-surface-container/60 backdrop-blur-md border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex justify-around items-center px-6 pb-8 pt-4">
        {[
          { icon: "analytics", label: "Stats", active: false },
          { icon: "schedule", label: "Escalas", active: true },
          { icon: "shield", label: "Missões", active: false },
          { icon: "settings", label: "Ajustes", active: false },
        ].map((item, i) => (
          <div 
            key={i} 
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-90 ${
              item.active ? "text-primary bg-primary/10" : "text-slate-600 hover:text-slate-300"
            }`}
          >
            <span className="material-symbols-outlined text-2xl" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
