"use client";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-surface/40 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-white/5 font-sans text-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-surface-container-lowest/50 rounded-full px-4 py-1.5 flex items-center gap-3 w-full max-w-md group border border-white/5 focus-within:border-primary/50 transition-all">
          <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full placeholder:text-slate-500"
            placeholder="Pesquisar registro operacional..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-slate-300 hover:text-primary transition-colors scale-95 duration-150 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-surface"></span>
          </button>
          <button className="text-slate-300 hover:text-primary transition-colors scale-95 duration-150">
            <span className="material-symbols-outlined">g_translate</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <span className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">Comando Geral</p>
            <p className="text-[10px] text-slate-500 JetBrains_Mono_for_data uppercase">UID: 442-TX</p>
          </span>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-primary/20 p-0.5 group-hover:border-primary/50 transition-all overflow-hidden">
            <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary">account_circle</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
