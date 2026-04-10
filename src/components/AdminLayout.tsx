import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="md:ml-64 pt-24 pb-20 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-surface/80 backdrop-blur-md flex justify-around items-center px-6 pb-4 pt-2 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl p-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Feed</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 p-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">schedule</span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Troca</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 p-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">shield</span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Missão</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 p-2 active:scale-90 transition-transform relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
          <span className="font-sans text-[10px] uppercase tracking-widest mt-1">Alertas</span>
        </button>
      </nav>
    </div>
  );
}
