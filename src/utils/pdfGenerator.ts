import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { WorkerSummary, InfoIRCR, InfoDependente, PlanSaude } from '../tipos/s5002';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '').padStart(11, '0');
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '').padStart(14, '0');
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addSectionHeader(doc: jsPDF, y: number, number: string, title: string): number {
  doc.setFillColor(0, 51, 102);
  doc.rect(10, y, 190, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${number}. ${title}`, 14, y + 5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  return y + 9;
}

function addField(doc: jsPDF, y: number, label: string, value: string, x: number = 12, width: number = 186): number {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(label, x, y);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + width - 2, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  // Draw a thin line
  doc.setDrawColor(200, 200, 200);
  doc.line(x, y + 1.5, x + width, y + 1.5);
  return y + 6;
}

function addValueRow(doc: jsPDF, y: number, lineNum: string, label: string, value: number): number {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`${lineNum}.`, 12, y);
  doc.text(label, 19, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(formatMoney(value), 196, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(220, 220, 220);
  doc.line(12, y + 1.5, 198, y + 1.5);
  return y + 5.5;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number = 30): number {
  if (y + needed > 280) {
    doc.addPage();
    return 15;
  }
  return y;
}

export function generateInformeRendimentosPDF(worker: WorkerSummary, anoCalendario: string): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 10;

  // ==========================================
  // HEADER
  // ==========================================
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE RENDIMENTOS', 105, 10, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`IMPOSTO SOBRE A RENDA - PESSOA FÍSICA`, 105, 16, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ano-Calendário: ${anoCalendario}   |   Exercício: ${parseInt(anoCalendario) + 1}`, 105, 22, { align: 'center' });

  y = 30;

  // ==========================================
  // SEÇÃO 1 - FONTE PAGADORA
  // ==========================================
  y = addSectionHeader(doc, y, '1', 'FONTE PAGADORA (PESSOA JURÍDICA / PESSOA FÍSICA)');
  const cnpj = worker.empregador.tpInsc === '1'
    ? formatCNPJ(worker.empregador.nrInsc)
    : worker.empregador.nrInsc;
  y = addField(doc, y, 'CNPJ/CPF:', cnpj);
  y = addField(doc, y, 'Nome Empresarial / Nome:', worker.empregador.nome || 'Não Informado');
  y += 3;

  // ==========================================
  // SEÇÃO 2 - PESSOA FÍSICA BENEFICIÁRIA
  // ==========================================
  y = addSectionHeader(doc, y, '2', 'PESSOA FÍSICA BENEFICIÁRIA DOS RENDIMENTOS');
  y = addField(doc, y, 'CPF:', formatCPF(worker.cpf));
  y = addField(doc, y, 'Nome Completo:', worker.nome);
  if (worker.dtNascto) {
    y = addField(doc, y, 'Data de Nascimento:', worker.dtNascto);
  }
  if (worker.infoComplem?.endereco) {
    const end = worker.infoComplem.endereco;
    const endStr = [end.logradouro, end.nrLograd, end.bairro, end.cidade, end.uf, end.cep]
      .filter(Boolean).join(', ');
    if (endStr) {
      y = addField(doc, y, 'Endereço:', endStr);
    }
  }
  y += 3;

  // ==========================================
  // SEÇÃO 3 - RENDIMENTOS TRIBUTÁVEIS, DEDUÇÕES E IRRF
  // ==========================================
  y = checkPageBreak(doc, y, 60);
  y = addSectionHeader(doc, y, '3', 'RENDIMENTOS TRIBUTÁVEIS, DEDUÇÕES E IMPOSTO SOBRE A RENDA RETIDO NA FONTE');

  y = addValueRow(doc, y, '01', 'Total dos Rendimentos (inclusive férias)', worker.totalRendTrib);
  y = addValueRow(doc, y, '02', 'Contribuição Previdenciária Oficial', worker.totalPrevOficial + worker.totalContribPrev);
  y = addValueRow(doc, y, '03', 'Contribuição a Entidades de Previdência Complementar / FAPI / Fundação', worker.totalPrevPriv + worker.totalFundoPensPriv + worker.totalFundoPensOficial);
  y = addValueRow(doc, y, '04', 'Pensão Alimentícia', worker.totalPensAlim);
  y = addValueRow(doc, y, '05', 'Dedução de Dependentes', worker.totalDedDepen); // REQUESTED
  y = addValueRow(doc, y, '06', 'Imposto sobre a Renda Retido na Fonte', worker.totalIRRF);
  y += 1;

  // 13º Salário / Férias / RRA
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('INFORMAÇÕES ADICIONAIS DE TRIBUTAÇÃO:', 12, y);
  y += 4;
  y = addValueRow(doc, y, '07', '13º Salário', worker.totalRendTrib13);
  y = addValueRow(doc, y, '08', 'IRRF sobre o 13º Salário', worker.totalIRRF13);
  y = addValueRow(doc, y, '09', 'IRRF sobre Férias', worker.totalIRRFFerias); // REQUESTED
  y = addValueRow(doc, y, '10', 'IRRF sobre RRA', worker.totalIRRFRRA); // REQUESTED
  y += 3;

  // ==========================================
  // SEÇÃO 4 - RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS
  // ==========================================
  y = checkPageBreak(doc, y, 65);
  y = addSectionHeader(doc, y, '4', 'RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS');

  const totalIsento = worker.totalRendIsen65 + worker.totalRendMoleGrave +
    worker.totalDiarias + worker.totalAjudaCusto + worker.totalIndeniz +
    worker.totalRendIsenNTrib + worker.totalRendIsento + worker.totalAbonoFerias +
    worker.totalBolsaEstagio + worker.totalParcIsentaApos65;

  y = addValueRow(doc, y, '01', 'Parcela isenta dos proventos de aposentadoria (65 anos ou mais)', worker.totalRendIsen65 + worker.totalParcIsentaApos65);
  y = addValueRow(doc, y, '02', 'Diárias e ajuda de custo', worker.totalDiarias + worker.totalAjudaCusto);
  y = addValueRow(doc, y, '03', 'Pensão, proventos de aposentadoria por moléstia grave', worker.totalRendMoleGrave);
  y = addValueRow(doc, y, '04', 'Lucros e dividendos / Participação nos Lucros', worker.totalPartLucros);
  y = addValueRow(doc, y, '05', 'Valores pagos ao titular - bolsa de estágio', worker.totalBolsaEstagio);
  y = addValueRow(doc, y, '06', 'Indenizações por rescisão / Abono de férias', worker.totalIndeniz + worker.totalAbonoFerias);
  y = addValueRow(doc, y, '07', 'Outros rendimentos isentos e não tributáveis', worker.totalRendIsenNTrib + worker.totalRendIsento);
  y = addValueRow(doc, y, '', 'TOTAL DOS RENDIMENTOS ISENTOS', totalIsento);
  y += 3;

  // ==========================================
  // SEÇÃO 5 - RENDIMENTOS SUJEITOS À TRIBUTAÇÃO EXCLUSIVA
  // ==========================================
  y = checkPageBreak(doc, y, 30);
  y = addSectionHeader(doc, y, '5', 'RENDIMENTOS SUJEITOS À TRIBUTAÇÃO EXCLUSIVA (FONTE)');

  y = addValueRow(doc, y, '01', 'Rendimentos sujeitos à tributação exclusiva', worker.totalRendSusp);
  y = addValueRow(doc, y, '02', 'Rendimentos sujeitos à tributação exclusiva - Judicial', worker.totalRendSuspJud);
  y = addValueRow(doc, y, '03', 'Juros de mora', worker.totalJurosMora);
  y += 3;

  // ==========================================
  // SEÇÃO 6 - FGTS
  // ==========================================
  y = checkPageBreak(doc, y, 30);
  y = addSectionHeader(doc, y, '6', 'INFORMAÇÕES DE FGTS');

  y = addValueRow(doc, y, '01', 'Base de FGTS', worker.totalBcFGTS);
  y = addValueRow(doc, y, '02', 'Valor de FGTS depositado', worker.totalFGTS);
  y = addValueRow(doc, y, '03', 'Base de FGTS - Processo Trabalhista', worker.totalBcFGTSProcTrab);
  y = addValueRow(doc, y, '04', 'Base de FGTS - SEFIP', worker.totalBcFGTSSefip);
  y = addValueRow(doc, y, '05', 'Base de FGTS - Declaração Anterior', worker.totalBcFGTSDecAnt);
  y += 3;

  // ==========================================
  // SEÇÃO 7 - REEMBOLSO MÉDICO / PLANO DE SAÚDE
  // ==========================================
  const planSaude = worker.infoComplem?.planSaude || [];
  if (worker.totalReembMed > 0 || worker.totalSaudeTit > 0 || planSaude.length > 0) {
    y = checkPageBreak(doc, y, 30);
    y = addSectionHeader(doc, y, '7', 'PLANO DE SAÚDE / REEMBOLSO MÉDICO');

    // List Individual Plans
    planSaude.forEach((plan, idx) => {
      const label = plan.cnpjOper ? `Plano de Saúde (CNPJ: ${plan.cnpjOper})` : 'Plano de Saúde';
      y = addValueRow(doc, y, `0${idx + 1}`, label, plan.vlrSaudeTit || 0);
    });

    if (worker.totalSaudeTit > 0 && planSaude.length === 0) {
      y = addValueRow(doc, y, '01', 'Despesas com plano de saúde', worker.totalSaudeTit);
    }
    if (worker.totalReembMed > 0) {
      y = addValueRow(doc, y, '02', 'Total de reembolso médico / plano de saúde', worker.totalReembMed);
    }
    y += 3;
  }

  // ==========================================
  // SEÇÃO 8 - DEPENDENTES
  // ==========================================
  if (worker.dependentes.length > 0) {
    y = checkPageBreak(doc, y, 30);
    y = addSectionHeader(doc, y, '8', 'DEPENDENTES');

    const tableData = worker.dependentes.map(dep => [
      dep.nmDep || 'Não informado',
      dep.cpfDep || 'Não informado',
      dep.tpDep || '',
      dep.depIRRF === 'S' ? 'SIM' : 'NÃO'
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Nome', 'CPF', 'Tipo', 'IRRF']],
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fontStyle: 'bold' },
      margin: { left: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // ==========================================
  // SEÇÃO 9 - PENSÃO ALIMENTÍCIA (DETALHADO)
  // ==========================================
  if (worker.pensaoAlimenticia.length > 0 || worker.totalPensAlim > 0) {
    y = checkPageBreak(doc, y, 40);
    y = addSectionHeader(doc, y, '9', 'PENSÃO ALIMENTÍCIA');

    if (worker.pensaoAlimenticia.length > 0) {
      const tableData = worker.pensaoAlimenticia.map(pen => [
        pen.nmDep || pen.nmBenef || 'Beneficiário não identificado',
        pen.cpfDep || pen.cpfBenef || 'Não informado',
        pen.dtNasctoDep || 'Não informada',
        formatMoney(pen.vlrPensAlim || 0)
      ]);

      (doc as any).autoTable({
        startY: y,
        head: [['Nome do Beneficiário', 'CPF', 'Data Nasc.', 'Valor Pagos (R$)']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        margin: { left: 15, right: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 5;
    } else {
      y = addValueRow(doc, y, '01', 'Total de pensão alimentícia paga', worker.totalPensAlim);
    }
    y += 3;
  }

  // ==========================================
  // SEÇÃO 10 - CÓDIGOS DE RECEITA (IRRF detalhado)
  // ==========================================
  if (worker.ircrDetails.length > 0) {
    y = checkPageBreak(doc, y, 20);
    y = addSectionHeader(doc, y, '10', 'CÓDIGOS DE RECEITA - IRRF DETALHADO');

    // Aggregate by tpCR
    const crMap = new Map<string, number>();
    for (const cr of worker.ircrDetails) {
      crMap.set(cr.tpCR, (crMap.get(cr.tpCR) || 0) + cr.vrCR);
    }
    for (const [tpCR, vrCR] of crMap) {
      y = checkPageBreak(doc, y, 8);
      y = addValueRow(doc, y, '', `Código de Receita: ${tpCR}`, vrCR);
    }
    y += 3;
  }

  // ==========================================
  // SEÇÃO 11 - INFORMAÇÕES COMPLEMENTARES
  // ==========================================
  y = checkPageBreak(doc, y, 40);
  y = addSectionHeader(doc, y, '11', 'INFORMAÇÕES COMPLEMENTARES');

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);

  const compLines = [
    `Períodos de Apuração: ${worker.periodos.join(', ')}`,
    `Total de eventos S-5002 processados: ${worker.eventos.length}`,
    `Participação nos Lucros (PLR): R$ ${formatMoney(worker.totalPartLucros)}`, // REQUESTED
    `Contribuição Sindical: R$ ${formatMoney(worker.totalCompSind)}`,
    `Rendimentos recebidos de Pessoa Jurídica: R$ ${formatMoney(worker.totalRendPJ)}`
  ];

  compLines.forEach(line => {
    doc.text(line, 14, y);
    y += 4;
  });

  // Health Plan Summary in Section 11
  const plans = worker.infoComplem?.planSaude || [];
  if (plans.length > 0) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhes do Plano de Saúde:', 14, y);
    doc.setFont('helvetica', 'normal');
    y += 4;
    plans.forEach(plan => {
      doc.text(`Operadora: ${plan.cnpjOper || 'Não informado'} | Titular: R$ ${formatMoney(plan.vlrSaudeTit || 0)}`, 16, y);
      y += 3.5;
    });
  }

  // Judicial Info Summary
  if (worker.totalRendSuspJud > 0 || (worker.infoRRA && worker.infoRRA.some(r => r.nrProcRRA))) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Informações Judiciais:', 14, y);
    doc.setFont('helvetica', 'normal');
    y += 4;
    doc.text(`Rendimentos Judiciais Suspensos: R$ ${formatMoney(worker.totalRendSuspJud)}`, 16, y);
    y += 3.5;
  }

  // RRA Info
  if (worker.infoRRA && worker.infoRRA.length > 0) {
    y = checkPageBreak(doc, y, 20);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rendimentos Recebidos Acumuladamente (RRA):', 14, y);
    doc.setFont('helvetica', 'normal');
    y += 4;
    for (const rra of worker.infoRRA) {
      if (rra.descRRA) { doc.text(`Descrição: ${rra.descRRA}`, 16, y); y += 3.5; }
      if (rra.nrProcRRA) { doc.text(`Nº Processo: ${rra.nrProcRRA}`, 16, y); y += 3.5; }
      if (rra.qtdMesesRRA) { doc.text(`Qtd Meses: ${rra.qtdMesesRRA}`, 16, y); y += 3.5; }
      y += 2;
    }
  }

  // ==========================================
  // FOOTER
  // ==========================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Gerado pelo Sistema de Informe de Rendimentos eSocial S-5002 | Página ${i} de ${pageCount}`,
      105, 292,
      { align: 'center' }
    );
  }

  return doc;
}

// =====================================================
// Generate PDF for all workers (ZIP)
// =====================================================

export async function generateAllPDFs(
  workers: Map<string, WorkerSummary>,
  anoCalendario: string
): Promise<{ filename: string; pdf: jsPDF }[]> {
  const pdfs: { filename: string; pdf: jsPDF }[] = [];

  for (const [cpf, worker] of workers) {
    const pdf = generateInformeRendimentosPDF(worker, anoCalendario);
    const cleanCPF = cpf.replace(/\D/g, '');
    const cleanName = worker.nome.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    pdfs.push({
      filename: `InformeRendimentos_${anoCalendario}_${cleanCPF}_${cleanName}.pdf`,
      pdf,
    });
  }

  return pdfs;
}
