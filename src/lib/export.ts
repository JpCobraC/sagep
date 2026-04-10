import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Policial, Viagem, Sobreaviso } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// CSV Export
// ============================================================
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  const csv = Papa.unparse(data);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// PDF Export
// ============================================================
export function exportRankingPDF(
  policiais: Policial[],
  tipo: 'viagem' | 'sobreaviso'
): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(10, 22, 40);
  doc.text(`SAGEP — Ranking de ${tipo === 'viagem' ? 'Viagens' : 'Sobreaviso'}`, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);

  const sorted = [...policiais].sort((a, b) =>
    tipo === 'viagem'
      ? b.pontos_acumulados_viagem - a.pontos_acumulados_viagem
      : b.dias_acumulados_sobreaviso - a.dias_acumulados_sobreaviso
  );

  const headColumns = tipo === 'viagem'
    ? [['#', 'Nome', 'Matrícula', 'Status', 'Pontos Acumulados']]
    : [['#', 'Nome', 'Matrícula', 'Status', 'Dias Acumulados']];

  const body = sorted.map((p, i) => [
    String(i + 1),
    p.nome,
    p.cpf_matricula,
    p.status === 'ativo' ? 'Ativo' : 'Inativo',
    tipo === 'viagem'
      ? String(p.pontos_acumulados_viagem)
      : String(p.dias_acumulados_sobreaviso),
  ]);

  autoTable(doc, {
    startY: 38,
    head: headColumns,
    body,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [10, 22, 40], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`ranking_${tipo}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportViagensPDF(viagens: Viagem[]): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(10, 22, 40);
  doc.text('SAGEP — Relatório de Viagens', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);

  const body = viagens.map((v) => [
    v.destino,
    format(new Date(v.data_inicio), 'dd/MM/yyyy'),
    format(new Date(v.data_fim), 'dd/MM/yyyy'),
    String(v.nivel),
    v.nome_policial || '—',
    v.status === 'confirmado' ? 'Confirmado' : 'Pendente',
    String(v.pontos),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['Destino', 'Início', 'Fim', 'Nível', 'Policial', 'Status', 'Pontos']],
    body,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [10, 22, 40], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`viagens_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportSobreavisoPDF(sobreavisos: Sobreaviso[]): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(10, 22, 40);
  doc.text('SAGEP — Relatório de Sobreaviso', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);

  const body = sobreavisos.map((s) => [
    format(new Date(s.data), 'dd/MM/yyyy'),
    format(new Date(s.horario_inicio), 'HH:mm'),
    format(new Date(s.horario_fim), 'HH:mm'),
    s.nome_policial || '—',
    s.status === 'confirmado' ? 'Confirmado' : 'Pendente',
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['Data', 'Início', 'Fim', 'Policial', 'Status']],
    body,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [10, 22, 40], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`sobreaviso_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ============================================================
// Ranking CSV helpers
// ============================================================
export function exportRankingCSV(policiais: Policial[], tipo: 'viagem' | 'sobreaviso'): void {
  const sorted = [...policiais].sort((a, b) =>
    tipo === 'viagem'
      ? b.pontos_acumulados_viagem - a.pontos_acumulados_viagem
      : b.dias_acumulados_sobreaviso - a.dias_acumulados_sobreaviso
  );

  const data = sorted.map((p, i) => ({
    Posição: i + 1,
    Nome: p.nome,
    Matrícula: p.cpf_matricula,
    Status: p.status === 'ativo' ? 'Ativo' : 'Inativo',
    [tipo === 'viagem' ? 'Pontos Acumulados' : 'Dias Acumulados']:
      tipo === 'viagem' ? p.pontos_acumulados_viagem : p.dias_acumulados_sobreaviso,
  }));

  exportToCSV(data, `ranking_${tipo}_${format(new Date(), 'yyyy-MM-dd')}`);
}
