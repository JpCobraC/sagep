"use client";

export const dynamic = 'force-dynamic';

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState, useMemo } from "react";
import { Policial, Viagem, Sobreaviso } from "@/types";
import { 
  subscribePoliciais, 
  subscribeViagens, 
  subscribeSobreaviso 
} from "@/lib/firestore";
import { exportRankingPDF, exportRankingCSV } from "@/lib/export";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("Ativos");
  const [policiais, setPoliciais] = useState<Policial[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [sobreavisos, setSobreavisos] = useState<Sobreaviso[]>([]);

  useEffect(() => {
    const unsubPoliciais = subscribePoliciais(setPoliciais);
    const unsubViagens = subscribeViagens(setViagens);
    const unsubSobreaviso = subscribeSobreaviso(setSobreavisos);

    return () => {
      unsubPoliciais();
      unsubViagens();
      unsubSobreaviso();
    };
  }, []);

  // Filtered Ranking
  const rankedPoliciais = useMemo(() => {
    return [...policiais]
      .filter(p => activeTab === "Todos" || (activeTab === "Ativos" && p.status === 'ativo') || (activeTab === "Inativos" && p.status === 'inativo'))
      .sort((a, b) => b.pontos_acumulados_viagem - a.pontos_acumulados_viagem);
  }, [policiais, activeTab]);

  const leader = rankedPoliciais[0];
  
  const averagePoints = useMemo(() => {
    if (policiais.length === 0) return 0;
    const total = policiais.reduce((acc, p) => acc + p.pontos_acumulados_viagem, 0);
    return Math.round(total / policiais.length);
  }, [policiais]);

  const handleExportPDF = () => {
    exportRankingPDF(rankedPoliciais, "viagem");
  };

  const handleExportCSV = () => {
    exportRankingCSV(rankedPoliciais, "viagem");
  };

  return (
    <AdminLayout>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            RANKING <span className="text-primary">MASTER</span>
          </h2>
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span>Motor de Meritocracia Operacional</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-3 bg-surface-container-high border border-white/5 rounded-2xl text-on-surface hover:bg-surface-container-highest transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
            <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-surface-container-high border border-white/5 rounded-2xl text-on-surface hover:bg-surface-container-highest transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-tertiary">csv</span>
            <span className="text-[10px] font-black uppercase tracking-widest">CSV</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Stats & Charts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        {/* Comparison Chart Area Area */}
        <div className="md:col-span-8 bg-surface-container/40 backdrop-blur-md rounded-3xl p-8 relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-bold text-white italic">Dinâmica de Pontuação</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Distribuição por Categoria</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">Viagens</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary ring-4 ring-tertiary/20"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">Dias de Sobreaviso</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between px-6 space-x-6">
            {rankedPoliciais.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex-1 flex flex-col items-center group relative">
                <div className="w-full flex items-end justify-center space-x-1.5 h-full relative">
                  <div 
                    className={`w-1/3 rounded-t-xl transition-all duration-700 ${
                      i === 0 
                        ? "bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]" 
                        : "bg-primary/20 group-hover:bg-primary/40"
                    }`} 
                    style={{ height: `${(p.pontos_acumulados_viagem / (leader?.pontos_acumulados_viagem || 1)) * 100}%` }}
                  ></div>
                  <div 
                    className={`w-1/3 rounded-t-xl transition-all duration-700 delay-100 ${
                      i === 0 
                        ? "bg-tertiary shadow-[0_0_20px_rgba(var(--tertiary-rgb),0.4)]" 
                        : "bg-tertiary/20 group-hover:bg-tertiary/40"
                    }`} 
                    style={{ height: `${(p.dias_acumulados_sobreaviso / 30) * 100}%` }}
                  ></div>
                </div>
                <span className={`mt-4 text-[9px] font-black font-mono truncate max-w-full italic ${i === 0 ? "text-primary" : "text-slate-600"}`}>
                   {p.nome.split(' ')[0]}
                </span>
              </div>
            ))}
            {rankedPoliciais.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-700 italic text-sm">Processando telemetria...</div>
            )}
          </div>
        </div>

        {/* Global Leader Summary */}
        <div className="md:col-span-4 flex flex-col space-y-8">
          <div className="flex-1 bg-gradient-to-br from-primary-container/40 to-blue-900/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-primary/20 group">
            <div className="absolute -right-6 -top-6 p-8 opacity-10 transform scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
               <span className="material-symbols-outlined text-9xl text-white">military_tech</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-4 italic underline decoration-blue-500/50 underline-offset-4">Oficial de Elite</p>
              <h4 className="text-2xl font-black text-white leading-tight mb-8 truncate">{leader?.nome || "---"}</h4>
              <div className="flex items-stretch justify-between">
                <div>
                  <p className="text-[10px] text-blue-300 uppercase font-black tracking-tighter">Pontuação</p>
                  <p className="text-3xl font-black text-white JetBrains_Mono_for_data">{leader?.pontos_acumulados_viagem || 0}</p>
                </div>
                <div className="w-px bg-white/10 mx-4"></div>
                <div>
                  <p className="text-[10px] text-blue-300 uppercase font-black tracking-tighter">Ranking</p>
                  <p className="text-3xl font-black text-white JetBrains_Mono_for_data">#01</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/5">
               <span className="text-[9px] font-black text-white uppercase tracking-widest">STATUS_IMPACTO</span>
               <span className="text-[9px] font-black text-tertiary uppercase">MAX_LEVEL</span>
            </div>
          </div>
          
          <div className="bg-surface-container rounded-3xl p-8 border border-white/5 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-xl">equalizer</span>
              <span className="text-[10px] font-black text-tertiary bg-tertiary/10 px-3 py-1 rounded-full uppercase">Global Intel</span>
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Média de Meritocracia</h5>
              <p className="text-4xl font-black text-white truncate JetBrains_Mono_for_data">
                {averagePoints} <span className="text-xs text-slate-600">PTS</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Officer List Table Container */}
      <div className="bg-surface-container rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-high/30">
          <div>
            <h3 className="text-xl font-black text-white italic tracking-tight">Full Efetivo Ledger</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Sincronizado com o núcleo de dados de missões</p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-lowest p-1.5 rounded-2xl border border-white/5">
            {["Ativos", "Inativos", "Todos"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Oficial / Identificação</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Viagens Ativas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Dias Sobreaviso</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Saldo de Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rankedPoliciais.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-6">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black JetBrains_Mono_for_data ${
                      i === 0 ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 
                      i === 1 ? 'bg-secondary-container text-on-secondary-container' : 
                      i === 2 ? 'bg-tertiary text-on-tertiary-container' : 'bg-surface-container-highest text-slate-500'
                    }`}>
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-highest border border-white/5 flex items-center justify-center text-slate-500 group-hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-2xl">person</span>
                      </div>
                      <div>
                        <p className="font-black text-white text-base tracking-tight leading-tight">{p.nome}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{p.cpf_matricula}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-surface-container-highest rounded-lg text-[10px] font-black text-primary border border-primary/20">
                      LIVE_OPS
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center font-black JetBrains_Mono_for_data text-slate-300">
                    {p.dias_acumulados_sobreaviso}d
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <p className={`text-2xl font-black JetBrains_Mono_for_data leading-none ${i < 3 ? 'text-primary' : 'text-white'}`}>
                        {p.pontos_acumulados_viagem}
                      </p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mt-1">Pontos de Mérito</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rankedPoliciais.length === 0 && (
            <div className="py-24 text-center text-slate-600 italic uppercase font-black text-sm tracking-widest opacity-30">Nenhum oficial indexado no ledger.</div>
          )}
        </div>
        <div className="p-8 bg-surface-container-high/20 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
            Processando {rankedPoliciais.length} registros de meritocracia ativa
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
