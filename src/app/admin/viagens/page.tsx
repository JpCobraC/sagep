"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Policial, Viagem, Impedimento, NivelViagem } from "@/types";
import { 
  subscribeViagens, 
  subscribePoliciais, 
  subscribeImpedimentos, 
  createViagem, 
  confirmViagem,
  updateViagem
} from "@/lib/firestore";
import { sugerirPolicialViagem, calcularPontosViagem } from "@/lib/business-logic";

export default function ViagensPage() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [policiais, setPoliciais] = useState<Policial[]>([]);
  const [impedimentos, setImpedimentos] = useState<Impedimento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  // Form State
  const [newViagem, setNewViagem] = useState({
    destino: "",
    data_inicio: format(new Date(), "yyyy-MM-dd"),
    data_fim: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    nivel: 1 as NivelViagem,
    policial_id: "",
  });

  useEffect(() => {
    const unsubViagens = subscribeViagens(setViagens);
    const unsubPoliciais = subscribePoliciais(setPoliciais);
    const unsubImpedimentos = subscribeImpedimentos(setImpedimentos);

    return () => {
      unsubViagens();
      unsubPoliciais();
      unsubImpedimentos();
    };
  }, []);

  // Filtered List
  const filteredViagens = useMemo(() => {
    return viagens.filter(v => {
      const matchFilter = filter === "Todos" || (filter === "Pendente" && v.status === "pendente") || (filter === "Confirmado" && v.status === "confirmado");
      const matchSearch = v.destino.toLowerCase().includes(search.toLowerCase()) || v.nome_policial?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [viagens, filter, search]);

  // Suggestion Logic
  const currentSuggestion = useMemo(() => {
    if (!newViagem.data_inicio || !newViagem.data_fim) return null;
    return sugerirPolicialViagem(
      { 
        data_inicio: new Date(newViagem.data_inicio), 
        data_fim: new Date(newViagem.data_fim) 
      },
      policiais,
      impedimentos
    );
  }, [newViagem.data_inicio, newViagem.data_fim, policiais, impedimentos]);

  const handleCreate = async () => {
    if (!newViagem.destino || !newViagem.policial_id) return;

    const policial = policiais.find(p => p.id === newViagem.policial_id);
    const pontos = calcularPontosViagem(newViagem.nivel, new Date(newViagem.data_inicio), new Date(newViagem.data_fim));

    await createViagem({
      destino: newViagem.destino,
      data_inicio: new Date(newViagem.data_inicio),
      data_fim: new Date(newViagem.data_fim),
      nivel: newViagem.nivel,
      policial_designado: newViagem.policial_id,
      nome_policial: policial?.nome || "Policial Desconhecido",
      status: "pendente",
      pontos: pontos,
    });

    setShowModal(false);
    setNewViagem({
      destino: "",
      data_inicio: format(new Date(), "yyyy-MM-dd"),
      data_fim: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      nivel: 1 as NivelViagem,
      policial_id: "",
    });
  };

  const handleConfirm = async (viagem: Viagem) => {
    if (!viagem.policial_designado) return;
    await confirmViagem(viagem.id, viagem.policial_designado, viagem.pontos);
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">SAGEP</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">Gestão de Viagens</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Registro Operacional de Viagens</h2>
          <p className="text-slate-400 mt-1 max-w-xl">Monitoramento e alocação de pessoal para deslocamentos táticos e administrativos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-container hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add_location_alt</span>
          Nova Viagem
        </button>
      </div>

      {/* Filters & Stats Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3 bg-surface-container rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Filtrar por:</span>
            <div className="flex gap-2">
              {["Todos", "Pendente", "Confirmado"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    filter === f 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : "bg-surface-container-low hover:bg-surface-container-highest text-slate-400 border-transparent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/5 hidden md:block"></div>
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">filter_list</span>
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/40 text-on-surface placeholder:text-slate-600" 
                placeholder="Pesquisar por ID, Nome ou Destino..." 
                type="text"
              />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-surface-container to-surface-container-low rounded-2xl p-6 flex flex-col justify-between border-l-4 border-tertiary">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Viagens Confirmadas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black text-white JetBrains_Mono_for_data tracking-tighter">
              {viagens.filter(v => v.status === 'confirmado').length}
            </span>
            <span className="text-slate-500 text-xs font-bold uppercase">Total</span>
          </div>
        </div>
      </div>

      {/* Tactical Table Section */}
      <div className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ref</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Oficial</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Período</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Destino</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status/Pontos</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredViagens.map((travel) => (
                <tr key={travel.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="JetBrains_Mono_for_data text-primary font-medium">#{travel.id.slice(0, 4).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500">person</span>
                      </div>
                      <span className="font-semibold text-on-surface">{travel.nome_policial}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-on-surface JetBrains_Mono_for_data text-xs whitespace-nowrap">
                        {format(new Date(travel.data_inicio), "dd MMM yy", { locale: ptBR })} - {format(new Date(travel.data_fim), "dd MMM yy", { locale: ptBR })}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">Nível {travel.nivel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-lg">location_on</span>
                      <span className="text-slate-300 truncate max-w-[150px]">{travel.destino}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest inline-flex items-center gap-1 w-fit ${
                        travel.status === 'pendente' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-tertiary/10 text-tertiary border-tertiary/20'
                      }`}>
                        {travel.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">+{travel.pontos} PTS</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {travel.status === 'pendente' && (
                        <button 
                          onClick={() => handleConfirm(travel)}
                          className="p-2 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 rounded-lg transition-all"
                          title="Confirmar Viagem"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </button>
                      )}
                      <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredViagens.length === 0 && (
            <div className="py-20 text-center text-slate-600 italic">Nenhum registro encontrado.</div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/90 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="bg-surface-container-highest rounded-3xl border border-white/5 p-8 max-w-5xl w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">Registro de Nova Missão de Viagem</h3>
                <p className="text-sm text-slate-400">Alocação inteligente baseada em meritocracia e disponibilidade.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-primary/30">Destino Operacional</label>
                  <input 
                    value={newViagem.destino}
                    onChange={e => setNewViagem({...newViagem, destino: e.target.value})}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 text-white outline-none" 
                    placeholder="Ex: Curitiba - PR (Unidade X)" 
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-primary/30">Data de Início</label>
                    <input 
                      value={newViagem.data_inicio}
                      onChange={e => setNewViagem({...newViagem, data_inicio: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none [color-scheme:dark]" 
                      type="date" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-primary/30">Data de Término</label>
                    <input 
                      value={newViagem.data_fim}
                      onChange={e => setNewViagem({...newViagem, data_fim: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none [color-scheme:dark]" 
                      type="date" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-primary/30">Nível Operacional (Complexidade)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, "longa_duracao"].map(n => (
                      <button
                        key={n}
                        onClick={() => setNewViagem({...newViagem, nivel: n as NivelViagem})}
                        className={`p-3 rounded-xl border-2 transition-all font-bold text-xs ${
                          newViagem.nivel === n 
                            ? "border-primary bg-primary/10 text-white" 
                            : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                        }`}
                      >
                        {n === "longa_duracao" ? "Longa" : `Nível ${n}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-primary/30">Seleção de Policial</label>
                  <select 
                    value={newViagem.policial_id}
                    onChange={e => setNewViagem({...newViagem, policial_id: e.target.value})}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none"
                  >
                    <option value="">Selecione um policial...</option>
                    {policiais.filter(p => p.status === 'ativo').map(p => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.pontos_acumulados_viagem} pts)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Suggestion Panel */}
              <div className="bg-surface-container rounded-3xl p-6 border border-white/5 relative flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-tertiary">psychology</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tighter italic">Assistente de Alocação de Efetivo</h4>
                </div>
                
                {currentSuggestion ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start gap-4 p-5 bg-surface-container-low rounded-2xl border border-tertiary/20 animate-in slide-in-from-right duration-300">
                      <div className="w-14 h-14 rounded-full border-2 border-tertiary p-0.5 shadow-[0_0_15px_rgba(var(--tertiary-rgb),0.3)] flex items-center justify-center bg-surface-container-highest">
                         <span className="material-symbols-outlined text-tertiary text-3xl">person</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recomendação do Sistema</p>
                            <h5 className="text-xl font-black text-white tracking-tight">{currentSuggestion.policial.nome}</h5>
                          </div>
                          <span className="JetBrains_Mono_for_data text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">MATCH OK</span>
                        </div>
                        <p className="mt-4 text-[11px] text-slate-400 leading-relaxed italic">
                          <strong className="text-tertiary">Justificativa:</strong> {currentSuggestion.reason}
                        </p>
                        <button 
                          onClick={() => setNewViagem({...newViagem, policial_id: currentSuggestion.policial.id})}
                          className="w-full mt-6 py-3 bg-tertiary text-on-tertiary-container text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(var(--tertiary-rgb),0.4)] transition-all active:scale-95"
                        >
                          Aplicar Recomendação
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">analytics</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Esta missão concederá <span className="text-primary">{calcularPontosViagem(newViagem.nivel, new Date(newViagem.data_inicio), new Date(newViagem.data_fim))} PONTOS</span> ao oficial selecionado.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 opacity-50">
                    <span className="material-symbols-outlined text-4xl">person_search</span>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ajuste as datas para ver sugestões de oficial disponível e com menor pontuação.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-white/5">
              <button 
                onClick={() => setShowModal(false)}
                className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-colors uppercase text-xs"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newViagem.destino || !newViagem.policial_id}
                className="px-10 py-3 rounded-xl font-black bg-primary text-on-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase text-xs disabled:opacity-50 disabled:hover:shadow-none"
              >
                Confirmar Registro Operacional
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
