"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}

const NavItem = ({ href, icon, label, active }: NavItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? "text-primary border-l-4 border-primary-container bg-primary-container/10 translate-x-1"
        : "text-slate-400 hover:text-slate-200 hover:bg-surface-container"
    }`}
  >
    <span className="material-symbols-outlined text-lg">{icon}</span>
    <span className="font-sans font-medium tracking-tight whitespace-nowrap">{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: "dashboard", label: "Dashboard" },
    { href: "/admin/policiais", icon: "groups", label: "Efetivo" },
    { href: "/admin/viagens", icon: "calendar_month", label: "Escalas de Viagem" },
    { href: "/admin/sobreaviso", icon: "security", label: "Sobreaviso" },
    { href: "/admin/ranking", icon: "military_tech", label: "Ranking de Mérito" },
    { href: "/admin/relatorios", icon: "analytics", label: "Relatórios" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-white/5 flex flex-col z-50 shadow-[20px_0_50px_rgba(0,0,0,0.3)] hidden md:flex">
      <div className="p-6 flex flex-col gap-1">
        {/* Brand */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 relative flex-shrink-0">
             <Image 
               src="/pf-logo.png" 
               alt="PF Logo" 
               fill 
               className="object-contain"
               priority
             />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              SAGEP
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Operational Command
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-white/5 pt-4">
          <button className="w-full mb-6 py-3 px-4 bg-primary-container text-on-primary-container rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Nova Escala
          </button>
          
          <Link
            href="/admin/configs"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-surface-container transition-all duration-200 rounded-xl mb-1"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="font-sans font-medium tracking-tight">Configurações</span>
          </Link>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 rounded-xl">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="font-sans font-medium tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
