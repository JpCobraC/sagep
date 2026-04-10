"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Policial, Sobreaviso } from "@/types";
import { 
  subscribeSobreaviso, 
  subscribePoliciais, 
  confirmSobreaviso,
  createSobreaviso 
} from "@/lib/firestore";
import { sugerirPolicialSobreaviso } from "@/lib/business-logic";

export default function SobreavisoPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sobreavisos, setSobreavisos] = useState<Sobreaviso[]>([]);
  const [policiais, setPoliciais] = useState<Policial[]>([]);
  const [view, setView] = useState("Month");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    const unsubSobreaviso = subscribeSobreaviso(setSobreavisos);
    const unsubPoliciais = subscribePoliciais(setPoliciais);
    return () => {
      unsubSobreaviso();
      unsubPoliciais();
    };
  }, []);

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSobreavisosForDate = (date: Date) => {
    return sobreavisos.filter(s => isSameDay(new Date(s.data), date));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
  };

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Sidebar Logic - Units for Today
  const todaySobreavisos = useMemo(() => {
    return sobreavisos.filter(s => isSameDay(new Date(s.data), new Date()));
  }, [sobreavisos]);

  const handleConfirm = async (id: string, policialId: string) => {
    await confirmSobreaviso(id, policialId);
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic">
            CONTROLE DE <span className="text-secondary-container">SOBREAVISO</span>
            <span className="text-[10px] font-mono px-2 py-1 bg-secondary-container/10 text-secondary-container border border-secondary-container/20 rounded uppercase tracking-widest not-italic">
              Operações em Tempo Real
            </span>
          </h2>
          <p className="text-slate-500 mt-1 max-w-lg font-medium text-sm">
            Monitoramento estratégico de prontidão e escalas táticas. <span className="text-tertiary">Meritocracia aplicada.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container rounded-xl p-1 border border-white/5">
          {["Month", "Week", "Day"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                view === v ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white"
              }`}
            >
              {v === "Month" ? "Mês" : v === "Week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Layout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Calendar Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-8 bg-surface-container-high/50 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black font-mono tracking-tighter text-white uppercase italic">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-xl border border-white/5 transition-colors">
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                  </button>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-xl border border-white/5 transition-colors">
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </button>
                </div>
              </div>
              {/* Legend */}
              <div className="hidden sm:flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.6)]"></span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confirmado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pendente</span>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 border-t border-white/5">
              {/* Days of week */}
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                <div key={day} className="p-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest border-r border-white/5 last:border-r-0 bg-surface-container-low/30">
                  {day}
                </div>
              ))}
              
              {/* Calendar Cells */}
              {calendarDays.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                const daySobreavisos = getSobreavisosForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[140px] p-3 border-t border-r border-white/5 last:border-r-0 font-mono text-sm relative transition-all cursor-pointer overflow-hidden ${
                      isToday ? "bg-primary/5" : isCurrentMonth ? "bg-surface-container/20 group hover:bg-white/[0.03]" : "bg-black/20 opacity-30"
                    } ${isSameDay(day, selectedDay || new Date(-1)) ? 'ring-2 ring-inset ring-primary' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`${isToday ? "text-primary font-black scale-110" : isCurrentMonth ? "text-slate-400 font-bold" : "text-slate-700"}`}>
                        {format(day, "dd")}
                      </span>
                      {isToday && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--primary)]"></div>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-1.5 pb-2">
                      {daySobreavisos.map((s) => (
                        <div 
                          key={s.id} 
                          className={`text-[9px] p-1.5 rounded-lg border-l-2 font-black tracking-tighter truncate ${
                            s.status === 'confirmado' 
                              ? 'bg-primary/10 text-primary border-primary' 
                              : 'bg-white/5 text-slate-400 border-white/20'
                          }`}
                        >
                          {s.nome_policial || "Não atribuído"}
                        </div>
                      ))}
                    </div>

                    <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-slate-200 text-black rounded-lg transition-all scale-75 group-hover:scale-100">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 bg-surface-variant/20 rounded-3xl border border-white/5 flex items-center gap-6">
             <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
               <span className="material-symbols-outlined text-3xl">lightbulb</span>
             </div>
             <div>
               <h4 className="text-sm font-bold text-white uppercase tracking-tight">Dica de Gestão</h4>
               <p className="text-xs text-slate-500 font-medium">Clique em um dia do calendário para gerenciar ou adicionar novos plantões de sobreaviso.</p>
             </div>
          </div>
        </div>

        {/* Officers Sidebar Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-black text-white tracking-tighter uppercase italic text-lg">Prontidão Hoje</h4>
              <span className="text-[10px] font-mono text-secondary-container bg-secondary-container/10 px-3 py-1 rounded-full uppercase font-black border border-secondary-container/20">
                {format(new Date(), "dd MMM", { locale: ptBR })}
              </span>
            </div>

            <div className="space-y-4">
              {todaySobreavisos.length > 0 ? todaySobreavisos.map((s) => (
                <div
                  key={s.id}
                  className={`group bg-surface-container-low hover:bg-surface-container-high transition-all p-5 rounded-2xl border-l-4 ${
                    s.status === 'confirmado' ? "border-primary" : "border-slate-700 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center border border-white/5 text-slate-500">
                        <span className="material-symbols-outlined text-2xl">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-white tracking-tight">{s.nome_policial || "Vago"}</p>
                        <p className="text-[10px] font-mono text-slate-500 uppercase">{format(new Date(s.horario_inicio), "HH:mm")} - {format(new Date(s.horario_fim), "HH:mm")}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                      s.status === 'confirmado' ? "text-primary bg-primary/10" : "text-slate-500 bg-white/5"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-5 flex gap-2">
                    {s.status === 'pendente' ? (
                      <button 
                        onClick={() => handleConfirm(s.id, s.policial_designado)}
                        className="flex-1 py-3 bg-secondary-container/10 text-secondary-container text-[10px] font-black uppercase tracking-widest rounded-xl border border-secondary-container/20 hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95"
                      >
                        Validar Presença
                      </button>
                    ) : (
                      <button className="flex-1 py-3 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 cursor-not-allowed">
                        Ciência Recebida
                      </button>
                    )}
                    <button className="p-3 bg-surface-container-highest rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5">
                      <span className="material-symbols-outlined text-sm">contact_support</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 opacity-30 italic text-sm">Nenhum plantão para hoje.</div>
              )}
            </div>

            {/* Stats Summary */}
            <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
              <div className="p-3 rounded-2xl bg-white/[0.02]">
                <p className="text-xl font-black text-white JetBrains_Mono_for_data">{policiais.length}</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Efetivo</p>
              </div>
              <div className="p-3 rounded-2xl bg-primary/5">
                <p className="text-xl font-black text-primary JetBrains_Mono_for_data">{todaySobreavisos.filter(s => s.status === 'pendente').length}</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Ciência Pend.</p>
              </div>
              <div className="p-3 rounded-2xl bg-tertiary/5">
                <p className="text-xl font-black text-tertiary JetBrains_Mono_for_data">{todaySobreavisos.length}</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Total Hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary-container/20 to-orange-900/10 border border-secondary-container/30 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>policy</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-container mb-3">
              <span className="material-symbols-outlined text-lg">shield_info</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diretriz Operacional</span>
            </div>
            <h5 className="text-white font-extrabold text-lg italic tracking-tight mb-3">Verificação de Plantão</h5>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Todos os oficiais em sobreaviso devem confirmar a escala através do HUD tático pessoal. Falhas de ciência são registradas em log de auditoria.
            </p>
            <button className="mt-6 w-full py-4 rounded-xl bg-white text-on-surface-variant font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-black/20">
              Gerar Relatório de Conformidade
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
