import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { WorkerSummary } from '../types/s5002';

function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '').padStart(11, '0');
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '').padStart(14, '0');
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

interface ExportRow {
  'CPF': string;
  'Nome': string;
  'CNPJ Empregador': string;
  'Nome Empregador': string;
  'Períodos': string;
  'Rend. Tributáveis': number;
  '13º Salário': number;
  'Prev. Oficial': number;
  'Prev. Privada': number;
  'Dedução Dependentes': number;
  'Pensão Alimentícia': number;
  'Contrib. Sindical': number;
  'IRRF Total': number;
  'IRRF 13º': number;
  'IRRF Férias': number;
  'IRRF RRA': number;
  'Isento 65+': number;
  'Moléstia Grave': number;
  'Diárias': number;
  'Ajuda de Custo': number;
  'Indenizações': number;
  'Rend. Isentos Outros': number;
  'Abono Férias': number;
  'Bolsa Estágio': number;
  'Part. Lucros': number;
  'Rend. Trib. Exclusiva': number;
  'Rend. Trib. Exclusiva Jud.': number;
  'Juros de Mora': number;
  'Base FGTS': number;
  'FGTS Depositado': number;
  'Base FGTS Proc. Trab.': number;
  'Base FGTS SEFIP': number;
  'Base FGTS Decl. Ant.': number;
  'Reembolso Médico': number;
  'Rend. PJ': number;
  'Contrib. Prev.': number;
  'Fundo Pensão Privado': number;
  'Fundo Pensão Oficial': number;
  'Qtd. Dependentes': number;
  'Qtd. Eventos': number;
}

function workerToRow(worker: WorkerSummary): ExportRow {
  const cnpj = worker.empregador.tpInsc === '1'
    ? formatCNPJ(worker.empregador.nrInsc)
    : worker.empregador.nrInsc;

  return {
    'CPF': formatCPF(worker.cpf),
    'Nome': worker.nome,
    'CNPJ Empregador': cnpj,
    'Nome Empregador': worker.empregador.nome || 'Não Informado',
    'Períodos': worker.periodos.join(', '),
    'Rend. Tributáveis': worker.totalRendTrib,
    '13º Salário': worker.totalRendTrib13,
    'Prev. Oficial': worker.totalPrevOficial + worker.totalContribPrev,
    'Prev. Privada': worker.totalPrevPriv,
    'Dedução Dependentes': worker.totalDedDepen,
    'Pensão Alimentícia': worker.totalPensAlim,
    'Contrib. Sindical': worker.totalCompSind,
    'IRRF Total': worker.totalIRRF,
    'IRRF 13º': worker.totalIRRF13,
    'IRRF Férias': worker.totalIRRFFerias,
    'IRRF RRA': worker.totalIRRFRRA,
    'Isento 65+': worker.totalRendIsen65 + worker.totalParcIsentaApos65,
    'Moléstia Grave': worker.totalRendMoleGrave,
    'Diárias': worker.totalDiarias,
    'Ajuda de Custo': worker.totalAjudaCusto,
    'Indenizações': worker.totalIndeniz,
    'Rend. Isentos Outros': worker.totalRendIsenNTrib + worker.totalRendIsento,
    'Abono Férias': worker.totalAbonoFerias,
    'Bolsa Estágio': worker.totalBolsaEstagio,
    'Part. Lucros': worker.totalPartLucros,
    'Rend. Trib. Exclusiva': worker.totalRendSusp,
    'Rend. Trib. Exclusiva Jud.': worker.totalRendSuspJud,
    'Juros de Mora': worker.totalJurosMora,
    'Base FGTS': worker.totalBcFGTS,
    'FGTS Depositado': worker.totalFGTS,
    'Base FGTS Proc. Trab.': worker.totalBcFGTSProcTrab,
    'Base FGTS SEFIP': worker.totalBcFGTSSefip,
    'Base FGTS Decl. Ant.': worker.totalBcFGTSDecAnt,
    'Reembolso Médico': worker.totalReembMed,
    'Rend. PJ': worker.totalRendPJ,
    'Contrib. Prev.': worker.totalContribPrev,
    'Fundo Pensão Privado': worker.totalFundoPensPriv,
    'Fundo Pensão Oficial': worker.totalFundoPensOficial,
    'Qtd. Dependentes': worker.dependentes.length,
    'Qtd. Eventos': worker.eventos.length,
  };
}

export function exportToXLSX(workers: Map<string, WorkerSummary>, filename: string = 'informe_rendimentos.xlsx'): void {
  const rows: ExportRow[] = [];
  for (const worker of workers.values()) {
    rows.push(workerToRow(worker));
  }

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length + 2, 15)
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Informe de Rendimentos');

  // Dependents sheet
  const depRows: Record<string, string | number>[] = [];
  for (const worker of workers.values()) {
    for (const dep of worker.dependentes) {
      depRows.push({
        'CPF Titular': formatCPF(worker.cpf),
        'Nome Titular': worker.nome,
        'CPF Dependente': dep.cpfDep ? formatCPF(dep.cpfDep) : '',
        'Nome Dependente': dep.nmDep || dep.descrDep || '',
        'Tipo': dep.tpDep || '',
        'Dedução IRRF': dep.depIRRF || '',
        'Valor Dedução': dep.vrDedDep || 0,
      });
    }
  }
  if (depRows.length > 0) {
    const wsDep = XLSX.utils.json_to_sheet(depRows);
    XLSX.utils.book_append_sheet(wb, wsDep, 'Dependentes');
  }

  // Pension sheet
  const penRows: Record<string, string | number>[] = [];
  for (const worker of workers.values()) {
    for (const pen of worker.pensaoAlimenticia) {
      penRows.push({
        'CPF Titular': formatCPF(worker.cpf),
        'Nome Titular': worker.nome,
        'CPF Beneficiário': pen.cpfDep || '',
        'Nome Beneficiário': pen.nmDep || '',
        'Valor Pensão': pen.vlrPensAlim || 0,
      });
    }
  }
  if (penRows.length > 0) {
    const wsPen = XLSX.utils.json_to_sheet(penRows);
    XLSX.utils.book_append_sheet(wb, wsPen, 'Pensão Alimentícia');
  }

  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbOut], { type: 'application/octet-stream' });
  saveAs(blob, filename);
}

export function exportToCSV(workers: Map<string, WorkerSummary>, filename: string = 'informe_rendimentos.csv'): void {
  const rows: ExportRow[] = [];
  for (const worker of workers.values()) {
    rows.push(workerToRow(worker));
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
}
