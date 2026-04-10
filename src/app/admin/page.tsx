"use client";

export const dynamic = 'force-dynamic';

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Policial, Viagem, Sobreaviso, AuditLog } from "@/types";
import { 
  subscribePoliciais, 
  subscribeViagens, 
  subscribeSobreaviso, 
  subscribeAuditLogs 
} from "@/lib/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const [policiais, setPoliciais] = useState<Policial[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [sobreavisos, setSobreavisos] = useState<Sobreaviso[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setTimestamp(new Date().toISOString());
    
    // Subscriptions
    const unsubPoliciais = subscribePoliciais(setPoliciais);
    const unsubViagens = subscribeViagens(setViagens);
    const unsubSobreaviso = subscribeSobreaviso(setSobreavisos);
    const unsubLogs = subscribeAuditLogs(setLogs, 10);

    return () => {
      unsubPoliciais();
      unsubViagens();
      unsubSobreaviso();
      unsubLogs();
    };
  }, []);

  // Metrics Calculation
  const efetivoAtivo = policiais.filter(p => p.status === 'ativo').length;
  const viagensEmCurso = viagens.filter(v => v.status === 'confirmado' && new Date(v.data_fim) >= new Date()).length;
  const sobreavisosHoje = sobreavisos.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    const sDate = new Date(s.data).toISOString().split('T')[0];
    return sDate === today;
  }).length;

  const capacity = policiais.length > 0 ? Math.round((efetivoAtivo / policiais.length) * 100) : 0;

  // Top 3 Ranking
  const topPoliciais = [...policiais]
    .sort((a, b) => b.pontos_acumulados_viagem - a.pontos_acumulados_viagem)
    .slice(0, 3);

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-white">
            Dashboard <span className="text-primary">Admin</span>
          </h2>
          <div className="flex items-center gap-2 text-slate-500 JetBrains_Mono_for_data text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span> SYSTEM_ONLINE
            </span>
            <span>//</span>
            <span>TIMESTAMP: {timestamp}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest border border-white/5 text-on-surface px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filtro Tático
          </button>
          <button className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Exportar Intel
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[2px_0_10px_rgba(var(--primary-rgb),0.4)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Efetivo Ativo</span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">person_check</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black JetBrains_Mono_for_data leading-none tracking-tighter">
              {efetivoAtivo}
            </span>
            <span className="text-tertiary text-sm JetBrains_Mono_for_data pb-1 flex items-center font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              LIVE
            </span>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              <span>Capacidade Operacional</span>
              <span>{capacity}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${capacity}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container shadow-[2px_0_10px_rgba(var(--secondary-container-rgb),0.4)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Missões Ativas</span>
            <span className="material-symbols-outlined text-secondary-container bg-secondary-container/10 p-2 rounded-lg">local_police</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black JetBrains_Mono_for_data leading-none tracking-tighter">
              {viagensEmCurso}
            </span>
            <span className="text-secondary-container text-sm JetBrains_Mono_for_data pb-1 flex items-center font-bold uppercase">
              Em curso
            </span>
          </div>
          <div className="mt-6 flex items-center gap-1">
            {[60, 40, 80, 30, 90, 50, 70].map((h, i) => (
              <div key={i} className="h-8 w-1.5 bg-secondary-container/20 rounded-full overflow-hidden flex flex-col justify-end flex-1">
                <div className="bg-secondary-container w-full rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-tertiary shadow-[2px_0_10px_rgba(var(--tertiary-rgb),0.4)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sobreavisos Hoje</span>
            <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg">event_available</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black JetBrains_Mono_for_data leading-none tracking-tighter">
              {sobreavisosHoje < 10 ? `0${sobreavisosHoje}` : sobreavisosHoje}
            </span>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter leading-tight max-w-[80px]">
              Turno Atual
            </span>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${n <= sobreavisosHoje ? 'bg-tertiary/20 text-tertiary' : 'bg-white/5 text-slate-600'}`}>
                {n}º T
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Body Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Audit Logs aka Activity Feed */}
          <div className="bg-surface-container-high/40 rounded-3xl p-8 border border-white/5 shadow-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Log de Operações</h3>
                <p className="text-xs text-slate-500 font-medium">Histórico recente de ações administrativas</p>
              </div>
              <span className="text-primary text-[10px] font-bold JetBrains_Mono_for_data bg-primary/10 px-3 py-1 rounded-full animate-pulse uppercase">Auditoria Live</span>
            </div>
            <div className="space-y-4">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="group bg-surface-container-low hover:bg-surface-container transition-all p-4 rounded-2xl flex items-start gap-4 border border-white/5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.action === 'create' ? 'bg-tertiary/20 text-tertiary' : 
                    log.action === 'update' ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'
                  }`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {log.action === 'create' ? 'add_circle' : log.action === 'update' ? 'edit' : 'delete'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-200">
                        {log.admin_nome} {log.action === 'create' ? 'criou' : log.action === 'update' ? 'atualizou' : 'removeu'} um registro
                      </h4>
                      <span className="JetBrains_Mono_for_data text-[10px] text-slate-500">
                        {log.timestamp ? format(log.timestamp, "HH:mm:ss") : "--:--:--"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Coleção: <span className="text-slate-200 uppercase font-mono">{log.collection}</span> // ID: <span className="text-slate-200 font-mono">{log.document_id.slice(0, 8)}...</span>
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-600 italic text-sm">Nenhuma atividade registrada.</div>
              )}
            </div>
          </div>

          {/* Strategic Map Placeholder */}
          <div className="bg-surface-container rounded-3xl overflow-hidden h-[300px] relative border border-white/5">
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
               <span className="material-symbols-outlined text-9xl">satellite_alt</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-widest italic">Monitoramento Georeferenciado</h4>
                <p className="text-[10px] text-slate-500 font-mono">MAP_LAYER_01 // SECURE_FEDERATION_V.2.4</p>
              </div>
              <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-bold text-white uppercase hover:bg-white/10 transition-colors">Abrir Visualizador</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Real Ranking */}
          <div className="bg-surface-container-high rounded-3xl p-8 border border-white/5 shadow-2xl relative">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              <h3 className="text-xl font-bold text-white tracking-tight italic">Ranking de Mérito</h3>
            </div>
            <p className="text-xs text-slate-500 mb-8 font-medium italic underline underline-offset-4 decoration-primary/30">Top Efetivo por Pontos de Viagem.</p>
            <div className="space-y-6">
              {topPoliciais.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-surface-variant flex items-center justify-center bg-surface-container-highest group-hover:border-primary transition-colors">
                       <span className="material-symbols-outlined text-slate-500">person</span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${i === 0 ? 'bg-secondary-container text-on-secondary-container shadow-[0_0_10px_rgba(var(--secondary-container-rgb),0.5)]' : 'bg-surface-variant text-white'} rounded-full flex items-center justify-center text-[10px] font-black border border-background`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-white leading-tight truncate">{p.nome}</h5>
                    <p className="text-[10px] text-slate-500 JetBrains_Mono_for_data uppercase truncate">{p.cpf_matricula}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black JetBrains_Mono_for_data ${i === 0 ? 'text-tertiary' : 'text-white'}`}>{p.pontos_acumulados_viagem}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Pontos</p>
                  </div>
                </div>
              ))}
              {topPoliciais.length === 0 && (
                <div className="text-center text-slate-600 text-xs italic py-4">Aguardando dados de efetivo...</div>
              )}
            </div>
            <button className="w-full mt-10 py-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
              Ver Ranking Completo
            </button>
          </div>

          {/* Tactical Alert */}
          <div className="bg-gradient-to-br from-primary-container/20 to-blue-900/10 border border-primary/30 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 group-hover:rotate-12 transition-transform duration-500">
              <span className="material-symbols-outlined text-9xl">analytics</span>
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2 uppercase italic">Estatísticas Operacionais</h3>
            <p className="text-sm text-blue-100 font-medium mb-6">O sistema está processando {viagens.length} viagens e {sobreavisos.length} sobreavisos no banco de dados.</p>
            <button className="w-full py-4 bg-white text-primary-container rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-black/20">
              Gerar Relatório Geral
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
