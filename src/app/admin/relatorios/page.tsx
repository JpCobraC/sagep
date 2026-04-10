"use client";

export const dynamic = 'force-dynamic';

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { subscribeAuditLogs } from "@/lib/firestore";
import { AuditLog } from "@/types";

export default function RelatoriosPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const unsub = subscribeAuditLogs(setLogs, 20);
    return () => unsub();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Central de <span className="text-primary">Inteligência</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
            Relatórios Operacionais e Auditoria de Sistema
          </p>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-surface-container-high border border-white/5 text-slate-300 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-white/10 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Gerar PDF
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-high/40 p-8 rounded-[2rem] border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Total de Missões</p>
          <p className="text-4xl font-black text-white JetBrains_Mono_for_data">124</p>
          <div className="mt-4 flex items-center gap-2 text-tertiary text-xs font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +12% este mês
          </div>
        </div>
        <div className="bg-surface-container-high/40 p-8 rounded-[2rem] border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Horas em Sobreaviso</p>
          <p className="text-4xl font-black text-white JetBrains_Mono_for_data">2.4k</p>
          <div className="mt-4 flex items-center gap-2 text-primary text-xs font-bold">
            <span className="material-symbols-outlined text-sm">verified</span>
            Disponibilidade: 98%
          </div>
        </div>
        <div className="bg-surface-container-high/40 p-8 rounded-[2rem] border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Média Meritocracia</p>
          <p className="text-4xl font-black text-white JetBrains_Mono_for_data">45.2</p>
          <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs font-bold">
             Pontos por Oficial
          </div>
        </div>
      </div>

      <div className="bg-surface-container/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <span className="material-symbols-outlined text-9xl">analytics</span>
        </div>
        <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">history_edu</span>
          Histórico de Alterações (Audit Log)
        </h3>
        
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
              <div className="flex items-center gap-6">
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                  log.action === 'create' ? 'bg-tertiary/20 text-tertiary' : 
                  log.action === 'update' ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'
                }`}>
                  {log.action}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    {log.admin_nome} interagiu com o banco de dados
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    ID: {log.document_id.slice(0, 8)} | Módulo: {log.collection}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-600 font-black JetBrains_Mono_for_data">
                {format(new Date(log.timestamp), "dd/MM/yy HH:mm")}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-20 text-slate-600 italic">Processando fluxos de dados...</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
