"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function PolicialRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsRegistering(true);
    
    try {
      // 1. Verificar se o e-mail está pré-cadastrado na coleção 'policiais'
      const q = query(collection(db, "policiais"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("Este e-mail funcional não consta na base de dados. Procure o administrador para realizar seu pré-cadastro.");
        setIsRegistering(false);
        return;
      }

      // 2. Se existe, criar o login no Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 3. Redirecionar para o portal (o AuthContext fará o vínculo automático via e-mail)
      router.push("/policial");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já possui um login ativo. Tente acessar a página de login.");
      } else {
        setError("Erro ao realizar cadastro operacional.");
      }
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-start">
          <Link href="/login/policial" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Já tenho acesso
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto mb-4 relative drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
             <Image src="/pf-logo-v3.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">PRIMEIRO ACESSO</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Validação de Credencial</p>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Funcional (Pré-cadastrado)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="nome.sobrenome@pf.gov.br"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Definir Senha Tática</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Senha</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase tracking-widest p-4 rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isRegistering}
              className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              {isRegistering ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "ATIVAR MEU ACESSO"
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 font-medium">
            O cadastro só será concluído se o seu e-mail funcional já estiver na base de dados do SAGEP.
          </p>
        </div>
      </div>
    </div>
  );
}
