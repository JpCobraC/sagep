import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  increment,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Policial,
  Impedimento,
  Viagem,
  Sobreaviso,
  AuditLog,
  Notificacao,
} from '@/types';

// ============================================================
// Helpers — Firestore ↔ App conversion
// ============================================================
function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return new Date();
}

function convertDoc<T>(docSnap: { id: string; data: () => Record<string, unknown> }): T {
  const data = docSnap.data();
  const converted: Record<string, unknown> = { id: docSnap.id };
  for (const [key, val] of Object.entries(data)) {
    converted[key] = val instanceof Timestamp ? val.toDate() : val;
  }
  return converted as T;
}

// ============================================================
// Policiais
// ============================================================
export function subscribePoliciais(callback: (data: Policial[]) => void): Unsubscribe {
  const q = query(collection(db, 'policiais'), orderBy('nome'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Policial>(d)));
  });
}

export async function createPolicial(data: Omit<Policial, 'id' | 'created_at' | 'updated_at'>) {
  return addDoc(collection(db, 'policiais'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updatePolicial(id: string, data: Partial<Policial>) {
  const { id: _id, created_at: _c, ...rest } = data as Record<string, unknown>;
  return updateDoc(doc(db, 'policiais', id), { ...rest, updated_at: serverTimestamp() });
}

// ============================================================
// Impedimentos
// ============================================================
export function subscribeImpedimentos(callback: (data: Impedimento[]) => void): Unsubscribe {
  const q = query(collection(db, 'impedimentos'), orderBy('data_inicio', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Impedimento>(d)));
  });
}

export async function createImpedimento(data: Omit<Impedimento, 'id' | 'created_at'>) {
  return addDoc(collection(db, 'impedimentos'), {
    ...data,
    data_inicio: Timestamp.fromDate(data.data_inicio instanceof Date ? data.data_inicio : new Date(data.data_inicio)),
    data_fim: Timestamp.fromDate(data.data_fim instanceof Date ? data.data_fim : new Date(data.data_fim)),
    created_at: serverTimestamp(),
  });
}

export async function deleteImpedimento(id: string) {
  return deleteDoc(doc(db, 'impedimentos', id));
}

// ============================================================
// Viagens
// ============================================================
export function subscribeViagens(callback: (data: Viagem[]) => void): Unsubscribe {
  const q = query(collection(db, 'viagens'), orderBy('data_inicio', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Viagem>(d)));
  });
}

export async function createViagem(data: Omit<Viagem, 'id' | 'created_at' | 'updated_at'>) {
  return addDoc(collection(db, 'viagens'), {
    ...data,
    data_inicio: Timestamp.fromDate(data.data_inicio instanceof Date ? data.data_inicio : new Date(data.data_inicio)),
    data_fim: Timestamp.fromDate(data.data_fim instanceof Date ? data.data_fim : new Date(data.data_fim)),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updateViagem(id: string, data: Partial<Viagem>) {
  const { id: _id, created_at: _c, ...rest } = data as Record<string, unknown>;
  return updateDoc(doc(db, 'viagens', id), { ...rest, updated_at: serverTimestamp() });
}

export async function confirmViagem(viagemId: string, policialId: string, pontos: number) {
  await updateDoc(doc(db, 'viagens', viagemId), {
    status: 'confirmado',
    updated_at: serverTimestamp(),
  });
  await updateDoc(doc(db, 'policiais', policialId), {
    pontos_acumulados_viagem: increment(pontos),
    updated_at: serverTimestamp(),
  });
}

// ============================================================
// Sobreaviso
// ============================================================
export function subscribeSobreaviso(callback: (data: Sobreaviso[]) => void): Unsubscribe {
  const q = query(collection(db, 'sobreaviso'), orderBy('data', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Sobreaviso>(d)));
  });
}

export async function createSobreaviso(data: Omit<Sobreaviso, 'id' | 'created_at' | 'updated_at'>) {
  return addDoc(collection(db, 'sobreaviso'), {
    ...data,
    data: Timestamp.fromDate(data.data instanceof Date ? data.data : new Date(data.data)),
    horario_inicio: Timestamp.fromDate(data.horario_inicio instanceof Date ? data.horario_inicio : new Date(data.horario_inicio)),
    horario_fim: Timestamp.fromDate(data.horario_fim instanceof Date ? data.horario_fim : new Date(data.horario_fim)),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updateSobreaviso(id: string, data: Partial<Sobreaviso>) {
  const { id: _id, created_at: _c, ...rest } = data as Record<string, unknown>;
  return updateDoc(doc(db, 'sobreaviso', id), { ...rest, updated_at: serverTimestamp() });
}

export async function confirmSobreaviso(sobreavisoId: string, policialId: string) {
  await updateDoc(doc(db, 'sobreaviso', sobreavisoId), {
    status: 'confirmado',
    updated_at: serverTimestamp(),
  });
  await updateDoc(doc(db, 'policiais', policialId), {
    dias_acumulados_sobreaviso: increment(1),
    updated_at: serverTimestamp(),
  });
}

// ============================================================
// Audit Logs
// ============================================================
export async function createAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>) {
  return addDoc(collection(db, 'audit_logs'), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export function subscribeAuditLogs(callback: (data: AuditLog[]) => void, limitCount = 50): Unsubscribe {
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.slice(0, limitCount).map((d) => convertDoc<AuditLog>(d)));
  });
}

// ============================================================
// Notificações
// ============================================================
export function subscribeNotificacoes(policialId: string, callback: (data: Notificacao[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'notificacoes'),
    where('policial_id', '==', policialId),
    orderBy('created_at', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Notificacao>(d)));
  });
}

export async function createNotificacao(data: Omit<Notificacao, 'id' | 'created_at'>) {
  return addDoc(collection(db, 'notificacoes'), {
    ...data,
    created_at: serverTimestamp(),
  });
}

export async function markNotificacaoAsRead(id: string) {
  return updateDoc(doc(db, 'notificacoes', id), { lida: true });
}
