"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";

interface User {
  uid: string;
  email: string;
  nome: string;
  role: 'admin' | 'policial';
  policialId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveUser(firebaseUser: FirebaseUser): Promise<User> {
    try {
      // 1. Check if admin
      const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        return { 
          uid: firebaseUser.uid, 
          email: firebaseUser.email || "", 
          role: 'admin', 
          nome: data.nome || "Administrador" 
        };
      }

      // 2. Check if linked user mapping exists
      const userMapDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userMapDoc.exists()) {
        const data = userMapDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          role: data.role || 'policial',
          policialId: data.policial_id,
          nome: data.nome
        };
      }

      // 3. Fallback: Search in 'policiais' collection by email
      const q = query(collection(db, "policiais"), where("email", "==", firebaseUser.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const pDoc = querySnapshot.docs[0];
        const pData = pDoc.data();
        
        // Create user mapping for faster future logins
        const userData = {
          policial_id: pDoc.id,
          email: firebaseUser.email,
          nome: pData.nome,
          role: 'policial'
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), userData);

        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          role: 'policial',
          policialId: pDoc.id,
          nome: pData.nome
        };
      }

      // 4. If nothing found, this user is not authorized
      console.warn(`Acesso negado: Perfil não encontrado para o e-mail ${firebaseUser.email}`);
      await firebaseSignOut(auth);
      throw new Error("Seu perfil ainda não foi cadastrado pelo administrador. Procure o comando.");
    } catch (err) {
      console.error("Error in resolveUser:", err);
      throw err;
    }
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const resolved = await resolveUser(firebaseUser);
          setUser(resolved);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
