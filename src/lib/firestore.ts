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
import {
  MOCK_POLICIAIS,
  MOCK_VIAGENS,
  MOCK_SOBREAVISOS,
  MOCK_IMPEDIMENTOS,
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICACOES,
} from './mock-data';

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

const noopUnsubscribe: Unsubscribe = () => {};

// ============================================================
// In-memory mock store (mutable for local interactions)
// ============================================================
let mockPoliciais = [...MOCK_POLICIAIS];
let mockViagens = [...MOCK_VIAGENS];
let mockSobreavisos = [...MOCK_SOBREAVISOS];
let mockImpedimentos = [...MOCK_IMPEDIMENTOS];
let mockAuditLogs = [...MOCK_AUDIT_LOGS];
let mockNotificacoes = [...MOCK_NOTIFICACOES];

// Subscribers for reactive mock updates
type Listener<T> = (data: T[]) => void;
const policialListeners: Set<Listener<Policial>> = new Set();
const viagemListeners: Set<Listener<Viagem>> = new Set();
const sobreavisoListeners: Set<Listener<Sobreaviso>> = new Set();
const impedimentoListeners: Set<Listener<Impedimento>> = new Set();
const auditLogListeners: Set<Listener<AuditLog>> = new Set();
const notificacaoListeners: Map<string, Set<Listener<Notificacao>>> = new Map();

function notifyPoliciais() { policialListeners.forEach(cb => cb([...mockPoliciais])); }
function notifyViagens() { viagemListeners.forEach(cb => cb([...mockViagens])); }
function notifySobreavisos() { sobreavisoListeners.forEach(cb => cb([...mockSobreavisos])); }
function notifyImpedimentos() { impedimentoListeners.forEach(cb => cb([...mockImpedimentos])); }
function notifyAuditLogs() { auditLogListeners.forEach(cb => cb([...mockAuditLogs])); }

// ============================================================
// Policiais
// ============================================================
export function subscribePoliciais(callback: (data: Policial[]) => void): Unsubscribe {
  if (!db) {
    // Mock mode
    policialListeners.add(callback);
    setTimeout(() => callback([...mockPoliciais]), 50);
    return () => { policialListeners.delete(callback); };
  }
  const q = query(collection(db, 'policiais'), orderBy('nome'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Policial>(d)));
  });
}

export async function createPolicial(data: Omit<Policial, 'id' | 'created_at' | 'updated_at'>) {
  if (!db) {
    const newPolicial: Policial = {
      ...data,
      id: 'policial_' + Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockPoliciais.push(newPolicial);
    notifyPoliciais();
    return;
  }
  return addDoc(collection(db, 'policiais'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updatePolicial(id: string, data: Partial<Policial>) {
  if (!db) {
    mockPoliciais = mockPoliciais.map(p =>
      p.id === id ? { ...p, ...data, updated_at: new Date() } : p
    );
    notifyPoliciais();
    return;
  }
  const { id: _id, created_at: _c, ...rest } = data as Record<string, unknown>;
  return updateDoc(doc(db, 'policiais', id), { ...rest, updated_at: serverTimestamp() });
}

// ============================================================
// Impedimentos
// ============================================================
export function subscribeImpedimentos(callback: (data: Impedimento[]) => void): Unsubscribe {
  if (!db) {
    impedimentoListeners.add(callback);
    setTimeout(() => callback([...mockImpedimentos]), 50);
    return () => { impedimentoListeners.delete(callback); };
  }
  const q = query(collection(db, 'impedimentos'), orderBy('data_inicio', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Impedimento>(d)));
  });
}

export async function createImpedimento(data: Omit<Impedimento, 'id' | 'created_at'>) {
  if (!db) {
    const newImp: Impedimento = {
      ...data,
      id: 'impedimento_' + Date.now(),
      created_at: new Date(),
    };
    mockImpedimentos.push(newImp);
    notifyImpedimentos();
    return;
  }
  return addDoc(collection(db, 'impedimentos'), {
    ...data,
    data_inicio: Timestamp.fromDate(data.data_inicio instanceof Date ? data.data_inicio : new Date(data.data_inicio)),
    data_fim: Timestamp.fromDate(data.data_fim instanceof Date ? data.data_fim : new Date(data.data_fim)),
    created_at: serverTimestamp(),
  });
}

export async function deleteImpedimento(id: string) {
  if (!db) {
    mockImpedimentos = mockImpedimentos.filter(i => i.id !== id);
    notifyImpedimentos();
    return;
  }
  return deleteDoc(doc(db, 'impedimentos', id));
}

// ============================================================
// Viagens
// ============================================================
export function subscribeViagens(callback: (data: Viagem[]) => void): Unsubscribe {
  if (!db) {
    viagemListeners.add(callback);
    setTimeout(() => callback([...mockViagens]), 50);
    return () => { viagemListeners.delete(callback); };
  }
  const q = query(collection(db, 'viagens'), orderBy('data_inicio', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Viagem>(d)));
  });
}

export async function createViagem(data: Omit<Viagem, 'id' | 'created_at' | 'updated_at'>) {
  if (!db) {
    const newViagem: Viagem = {
      ...data,
      id: 'viagem_' + Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockViagens.unshift(newViagem);
    notifyViagens();
    return;
  }
  return addDoc(collection(db, 'viagens'), {
    ...data,
    data_inicio: Timestamp.fromDate(data.data_inicio instanceof Date ? data.data_inicio : new Date(data.data_inicio)),
    data_fim: Timestamp.fromDate(data.data_fim instanceof Date ? data.data_fim : new Date(data.data_fim)),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updateViagem(id: string, data: Partial<Viagem>) {
  if (!db) {
    mockViagens = mockViagens.map(v =>
      v.id === id ? { ...v, ...data, updated_at: new Date() } : v
    );
    notifyViagens();
    return;
  }
  const { id: _id, created_at: _c, ...rest } = data as Record<string, unknown>;
  return updateDoc(doc(db, 'viagens', id), { ...rest, updated_at: serverTimestamp() });
}

export async function confirmViagem(viagemId: string, policialId: string, pontos: number) {
  if (!db) {
    mockViagens = mockViagens.map(v =>
      v.id === viagemId ? { ...v, status: 'confirmado' as const, updated_at: new Date() } : v
    );
    mockPoliciais = mockPoliciais.map(p =>
      p.id === policialId ? { ...p, pontos_acumulados_viagem: p.pontos_acumulados_viagem + pontos, updated_at: new Date() } : p
    );
    notifyViagens();
    notifyPoliciais();
    return;
  }
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
  if (!db) {
    sobreavisoListeners.add(callback);
    setTimeout(() => callback([...mockSobreavisos]), 50);
    return () => { sobreavisoListeners.delete(callback); };
  }
  const q = query(collection(db, 'sobreaviso'), orderBy('data', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => convertDoc<Sobreaviso>(d)));
  });
}

export async function createSobreaviso(data: Omit<Sobreaviso, 'id' | 'created_at' | 'updated_at'>) {
  if (!db) {
    const newSobreaviso: Sobreaviso = {
      ...data,
      id: 'sobreaviso_' + Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockSobreavisos.unshift(newSobreaviso);
    notifySobreavisos();
    return;
  }
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
  if (!db) {
    mockSobreavisos = mockSobreavisos.map(s =>
      s.id === id ? { ...s, ...data, updated_at: new Date() } : s
    );
    notifySobreavisos();
    return;
  }
  const { id: _id, created_at: _c, ...rest } = data as Record<string, unknown>;
  return updateDoc(doc(db, 'sobreaviso', id), { ...rest, updated_at: serverTimestamp() });
}

export async function confirmSobreaviso(sobreavisoId: string, policialId: string) {
  if (!db) {
    mockSobreavisos = mockSobreavisos.map(s =>
      s.id === sobreavisoId ? { ...s, status: 'confirmado' as const, updated_at: new Date() } : s
    );
    mockPoliciais = mockPoliciais.map(p =>
      p.id === policialId ? { ...p, dias_acumulados_sobreaviso: p.dias_acumulados_sobreaviso + 1, updated_at: new Date() } : p
    );
    notifySobreavisos();
    notifyPoliciais();
    return;
  }
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
  if (!db) {
    const newLog: AuditLog = {
      ...data,
      id: 'audit_' + Date.now(),
      timestamp: new Date(),
    };
    mockAuditLogs.unshift(newLog);
    notifyAuditLogs();
    return;
  }
  return addDoc(collection(db, 'audit_logs'), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export function subscribeAuditLogs(callback: (data: AuditLog[]) => void, limitCount = 50): Unsubscribe {
  if (!db) {
    auditLogListeners.add(callback);
    setTimeout(() => callback([...mockAuditLogs].slice(0, limitCount)), 50);
    return () => { auditLogListeners.delete(callback); };
  }
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.slice(0, limitCount).map((d) => convertDoc<AuditLog>(d)));
  });
}

// ============================================================
// Notificações
// ============================================================
export function subscribeNotificacoes(policialId: string, callback: (data: Notificacao[]) => void): Unsubscribe {
  if (!db) {
    const filtered = mockNotificacoes.filter(n => n.policial_id === policialId);
    setTimeout(() => callback(filtered), 50);
    return noopUnsubscribe;
  }
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
  if (!db) {
    const newNotif: Notificacao = {
      ...data,
      id: 'notif_' + Date.now(),
      created_at: new Date(),
    };
    mockNotificacoes.unshift(newNotif);
    return;
  }
  return addDoc(collection(db, 'notificacoes'), {
    ...data,
    created_at: serverTimestamp(),
  });
}

export async function markNotificacaoAsRead(id: string) {
  if (!db) {
    mockNotificacoes = mockNotificacoes.map(n =>
      n.id === id ? { ...n, lida: true } : n
    );
    return;
  }
  return updateDoc(doc(db, 'notificacoes', id), { lida: true });
}
