// ============================================================
// SAGEP — Firestore Data Model Types
// ============================================================

/** Officer status */
export type StatusPolicial = 'ativo' | 'inativo';

/** User role for access control */
export type UserRole = 'admin' | 'policial';

/** Impediment types */
export type TipoImpedimento = 'ferias' | 'missao' | 'curso' | 'licenca';

/** Schedule status */
export type StatusEscala = 'pendente' | 'confirmado';

/** Trip level (1-3 or long duration) */
export type NivelViagem = 1 | 2 | 3 | 'longa_duracao';

// ============================================================
// Collection: policiais
// ============================================================
export interface Policial {
  id: string;
  nome: string;
  email: string;
  cpf_matricula: string;
  status: StatusPolicial;
  role: UserRole;
  pontos_acumulados_viagem: number;
  dias_acumulados_sobreaviso: number;
  fcm_token?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// Collection: impedimentos
// ============================================================
export interface Impedimento {
  id: string;
  id_policial: string;
  nome_policial?: string; // denormalized for display
  tipo: TipoImpedimento;
  data_inicio: Date;
  data_fim: Date;
  created_at: Date;
}

// ============================================================
// Collection: viagens
// ============================================================
export interface Viagem {
  id: string;
  destino: string;
  data_inicio: Date;
  data_fim: Date;
  nivel: NivelViagem;
  policial_designado: string;
  nome_policial?: string; // denormalized for display
  status: StatusEscala;
  pontos: number; // calculated points for this trip
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// Collection: sobreaviso
// ============================================================
export interface Sobreaviso {
  id: string;
  data: Date;
  horario_inicio: Date;
  horario_fim: Date;
  policial_designado: string;
  nome_policial?: string; // denormalized for display
  status: StatusEscala;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// Collection: audit_logs
// ============================================================
export interface AuditLog {
  id: string;
  admin_id: string;
  admin_nome: string;
  action: 'create' | 'update' | 'delete';
  collection: string;
  document_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================
// Collection: notificacoes
// ============================================================
export interface Notificacao {
  id: string;
  policial_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'viagem' | 'sobreaviso' | 'sistema';
  lida: boolean;
  created_at: Date;
}

// ============================================================
// UI helpers
// ============================================================
export interface SuggestionResult {
  policial: Policial;
  reason: string;
}

export const IMPEDIMENTO_LABELS: Record<TipoImpedimento, string> = {
  ferias: 'Férias',
  missao: 'Missão',
  curso: 'Curso',
  licenca: 'Licença',
};

export const NIVEL_LABELS: Record<string, string> = {
  '1': 'Nível 1',
  '2': 'Nível 2',
  '3': 'Nível 3',
  'longa_duracao': 'Longa Duração',
};

export const STATUS_LABELS: Record<StatusEscala, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
};
