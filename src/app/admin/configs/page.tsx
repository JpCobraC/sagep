"use client";

export const dynamic = 'force-dynamic';

import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";

export default function ConfigsPage() {
  const [toggles, setToggles] = useState({
    autoAllocation: true,
    notifications: true,
    meritWeight: true,
    strictSchedules: false
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Configuração de <span className="text-primary">Sistema</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
            Parâmetros de Operação e Segurança SAGEP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container-high/40 rounded-[2.5rem] border border-white/5 p-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 italic">
              <span className="material-symbols-outlined text-primary">algorithm</span>
              Algoritmo de Alocação
            </h3>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-white">Alocação Inteligente Automática</h4>
                  <p className="text-xs text-slate-500">Sugere o oficial com menor pontuação e maior disponibilidade.</p>
                </div>
                <button 
                  onClick={() => toggle('autoAllocation')}
                  className={`w-14 h-8 rounded-full transition-all relative ${toggles.autoAllocation ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${toggles.autoAllocation ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-white">Notificações Push Prioritárias</h4>
                  <p className="text-xs text-slate-500">Envia alertas imediatos via Firebase Cloud Messaging.</p>
                </div>
                <button 
                  onClick={() => toggle('notifications')}
                  className={`w-14 h-8 rounded-full transition-all relative ${toggles.notifications ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${toggles.notifications ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-white">Modo de Escala Rígida</h4>
                  <p className="text-xs text-slate-500">Impede modificações em escalas confirmadas sem Auditoria nível 3.</p>
                </div>
                <button 
                  onClick={() => toggle('strictSchedules')}
                  className={`w-14 h-8 rounded-full transition-all relative ${toggles.strictSchedules ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${toggles.strictSchedules ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high/40 rounded-[2.5rem] border border-white/5 p-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 italic">
              <span className="material-symbols-outlined text-tertiary">database</span>
              Gerenciamento de Dados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center gap-4 transition-all">
                  <span className="material-symbols-outlined text-3xl">cloud_sync</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sincronizar Firestore</span>
               </button>
               <button className="p-6 bg-white/5 hover:bg-error/10 border border-white/5 hover:border-error/20 rounded-2xl flex flex-col items-center gap-4 transition-all group">
                  <span className="material-symbols-outlined text-3xl group-hover:text-error">delete_sweep</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-error">Limpar Cache de Logs</span>
               </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-primary-container/20 to-blue-900/10 border border-primary/30 rounded-[2.5rem] p-10">
              <span className="material-symbols-outlined text-primary text-5xl mb-6">shield</span>
              <h3 className="text-xl font-black text-white italic tracking-tighter mb-4">SEGURANÇA DO NÓ</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-8">O console administrativo SAGEP utiliza autenticação baseada em claims. Qualquer alteração crítica é registrada no log de auditoria global com carimbo de tempo irreversível.</p>
              <button className="w-full py-4 bg-primary text-on-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all">
                 VERIFICAR INTEGRIDADE
              </button>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
