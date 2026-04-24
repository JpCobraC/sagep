"use client";

export const dynamic = 'force-dynamic';

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState, useMemo } from "react";
import { Policial } from "@/types";
import { subscribePoliciais, updatePolicial, createPolicial } from "@/lib/firestore";
import { format } from "date-fns";

export default function PoliciaisPage() {
  const [policiais, setPoliciais] = useState<Policial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPolicial, setNewPolicial] = useState({
    nome: "",
    email: "",
    cpf_matricula: ""
  });

  useEffect(() => {
    const unsub = subscribePoliciais((data) => {
      setPoliciais(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredPoliciais = useMemo(() => {
    return policiais.filter(p => 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.cpf_matricula.includes(searchTerm)
    );
  }, [policiais, searchTerm]);

  const toggleStatus = async (policial: Policial) => {
    const newStatus = policial.status === 'ativo' ? 'inativo' : 'ativo';
    await updatePolicial(policial.id, { status: newStatus });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPolicial({
        ...newPolicial,
        status: 'ativo',
        role: 'policial',
        pontos_acumulados_viagem: 0,
        dias_acumulados_sobreaviso: 0,
        created_at: new Date(),
        updated_at: new Date()
      } as Policial);
      setIsModalOpen(false);
      setNewPolicial({ nome: "", email: "", cpf_matricula: "" });
    } catch (error) {
      console.error("Erro ao criar policial:", error);
      alert("Erro ao criar registro no Firestore.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Gestão de <span className="text-primary">Efetivo</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
            Controle de disponibilidade e mérito
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input 
              type="text" 
              placeholder="BUSCAR POLICIAL OU MATRÍCULA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-high border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/30 transition-all font-bold placeholder:text-slate-600 outline-none"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-surface-container/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Identificação</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic text-center">Mérito Viagem</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic text-center">D. Sobreaviso</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPoliciais.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">person</span>
                    </div>
                    <div>
                      <p className="font-black text-white uppercase tracking-tight italic">{p.nome}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest">{p.cpf_matricula}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      p.status === 'ativo' 
                        ? 'bg-tertiary/10 text-tertiary border-tertiary/20' 
                        : 'bg-error/10 text-error border-error/20'
                    }`}>
                      {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="text-xl font-black text-white JetBrains_Mono_for_data">{p.pontos_acumulados_viagem}</span>
                  <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">pts</span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="text-xl font-black text-white JetBrains_Mono_for_data">{p.dias_acumulados_sobreaviso}</span>
                  <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">d</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => toggleStatus(p)}
                    className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {p.status === 'ativo' ? 'person_off' : 'person_add'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredPoliciais.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <span className="material-symbols-outlined text-5xl">search_off</span>
                    <p className="text-xs font-black uppercase tracking-widest">Nenhum policial encontrado no radar.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Adicionar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-highest w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Novo Policial</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={newPolicial.nome}
                    onChange={(e) => setNewPolicial({...newPolicial, nome: e.target.value})}
                    className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Institucional</label>
                    <input 
                      type="email" 
                      required
                      value={newPolicial.email}
                      onChange={(e) => setNewPolicial({...newPolicial, email: e.target.value})}
                      className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matrícula/CPF</label>
                    <input 
                      type="text" 
                      required
                      value={newPolicial.cpf_matricula}
                      onChange={(e) => setNewPolicial({...newPolicial, cpf_matricula: e.target.value})}
                      className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-on-primary font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                Cadastrar Policial
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
