import { differenceInDays } from 'date-fns';
import type {
  Policial,
  Impedimento,
  Viagem,
  Sobreaviso,
  NivelViagem,
  SuggestionResult,
} from '@/types';

// ============================================================
// Scoring: Travel Points
// ============================================================

/**
 * Calculate points for a trip based on level and duration.
 * Rule: Always apply the HIGHEST value between level points and duration points.
 *
 * Level 1 → 1 point
 * Level 2 → 2 points
 * Level 3 → 3 points
 * Duration > 7 days → 3 points (fixed)
 */
export function calcularPontosViagem(nivel: NivelViagem, dataInicio: Date, dataFim: Date): number {
  // Points by level
  const pontosPorNivel: Record<string, number> = {
    '1': 1,
    '2': 2,
    '3': 3,
    'longa_duracao': 3,
  };

  const nivelKey = String(nivel);
  const pontosNivel = pontosPorNivel[nivelKey] ?? 1;

  // Duration-based points
  const duracao = differenceInDays(dataFim, dataInicio);
  const pontosDuracao = duracao > 7 ? 3 : 0;

  // Apply the HIGHEST value
  return Math.max(pontosNivel, pontosDuracao);
}

// ============================================================
// Impediment Check
// ============================================================

/**
 * Check if a policial has any active impediment during [rangeStart, rangeEnd].
 * Two date ranges overlap if start1 < end2 AND start2 < end1.
 */
export function hasImpedimentoNoIntervalo(
  policialId: string,
  impedimentos: Impedimento[],
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  return impedimentos.some(
    (imp) =>
      imp.id_policial === policialId &&
      imp.data_inicio < rangeEnd &&
      imp.data_fim > rangeStart
  );
}

/**
 * Filter out policiais that have impedimentos overlapping the given date range.
 * Also filters out inactive officers.
 */
export function filtrarPoliciaisDisponiveis(
  policiais: Policial[],
  impedimentos: Impedimento[],
  rangeStart: Date,
  rangeEnd: Date
): Policial[] {
  return policiais.filter(
    (p) =>
      p.status === 'ativo' &&
      !hasImpedimentoNoIntervalo(p.id, impedimentos, rangeStart, rangeEnd)
  );
}

// ============================================================
// Suggestion: Travel
// ============================================================

/**
 * Suggest the best officer for a trip:
 * 1. Filter: active officers without impediments in the trip's date range
 * 2. Sort: by lowest accumulated travel points
 * 3. Return: the top suggestion with reasoning
 */
export function sugerirPolicialViagem(
  viagem: Pick<Viagem, 'data_inicio' | 'data_fim'>,
  policiais: Policial[],
  impedimentos: Impedimento[]
): SuggestionResult | null {
  const disponiveis = filtrarPoliciaisDisponiveis(
    policiais,
    impedimentos,
    viagem.data_inicio,
    viagem.data_fim
  );

  if (disponiveis.length === 0) return null;

  // Sort by lowest accumulated points
  const sorted = [...disponiveis].sort(
    (a, b) => a.pontos_acumulados_viagem - b.pontos_acumulados_viagem
  );

  const best = sorted[0];
  return {
    policial: best,
    reason: `Menor pontuação acumulada: ${best.pontos_acumulados_viagem} pts. ${sorted.length} policial(is) disponível(is).`,
  };
}

/**
 * Get all available officers ranked for a trip (for the suggestion panel).
 */
export function listarSugestoesViagem(
  viagem: Pick<Viagem, 'data_inicio' | 'data_fim'>,
  policiais: Policial[],
  impedimentos: Impedimento[]
): Policial[] {
  const disponiveis = filtrarPoliciaisDisponiveis(
    policiais,
    impedimentos,
    viagem.data_inicio,
    viagem.data_fim
  );

  return [...disponiveis].sort(
    (a, b) => a.pontos_acumulados_viagem - b.pontos_acumulados_viagem
  );
}

// ============================================================
// Suggestion: On-Call (Sobreaviso)
// ============================================================

/**
 * Suggest the best officer for on-call duty:
 * 1. Filter: active officers without impediments on the date/time
 * 2. Sort: by lowest accumulated on-call days
 * 3. Return: the top suggestion with reasoning
 */
export function sugerirPolicialSobreaviso(
  sobreaviso: Pick<Sobreaviso, 'horario_inicio' | 'horario_fim'>,
  policiais: Policial[],
  impedimentos: Impedimento[]
): SuggestionResult | null {
  const disponiveis = filtrarPoliciaisDisponiveis(
    policiais,
    impedimentos,
    sobreaviso.horario_inicio,
    sobreaviso.horario_fim
  );

  if (disponiveis.length === 0) return null;

  const sorted = [...disponiveis].sort(
    (a, b) => a.dias_acumulados_sobreaviso - b.dias_acumulados_sobreaviso
  );

  const best = sorted[0];
  return {
    policial: best,
    reason: `Menor acumulado de sobreaviso: ${best.dias_acumulados_sobreaviso} dia(s). ${sorted.length} policial(is) disponível(is).`,
  };
}

/**
 * Get all available officers ranked for on-call (for the suggestion panel).
 */
export function listarSugestoesSobreaviso(
  sobreaviso: Pick<Sobreaviso, 'horario_inicio' | 'horario_fim'>,
  policiais: Policial[],
  impedimentos: Impedimento[]
): Policial[] {
  const disponiveis = filtrarPoliciaisDisponiveis(
    policiais,
    impedimentos,
    sobreaviso.horario_inicio,
    sobreaviso.horario_fim
  );

  return [...disponiveis].sort(
    (a, b) => a.dias_acumulados_sobreaviso - b.dias_acumulados_sobreaviso
  );
}
