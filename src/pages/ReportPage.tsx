import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useESocialStore } from '../store/esocialStore';
import { generateInformeRendimentosPDF, generateAllPDFs } from '../utils/pdfGenerator';
import { exportToXLSX, exportToCSV } from '../utils/excelExporter';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FilterOptions } from '../types/s5002';

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '').padStart(11, '0');
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

export default function ReportPage() {
  const { filteredWorkers, filter, setFilter, getAvailableYears, getAvailableMonths, workers } = useESocialStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const years = getAvailableYears();
  const months = getAvailableMonths();

  const ano = filter.ano || years[0] || new Date().getFullYear().toString();

  const handleGenerateAllPDFs = async () => {
    if (filteredWorkers.size === 0) return;
    setIsGenerating(true);
    setProgress({ current: 0, total: filteredWorkers.size });

    try {
      const zip = new JSZip();
      const pdfs = await generateAllPDFs(filteredWorkers, ano);

      for (let i = 0; i < pdfs.length; i++) {
        const { filename, pdf } = pdfs[i];
        const pdfData = pdf.output('arraybuffer');
        zip.file(filename, pdfData);
        setProgress({ current: i + 1, total: pdfs.length });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `InformesRendimentos_${ano}.zip`);
    } catch (error) {
      console.error('Error generating PDFs:', error);
    }

    setIsGenerating(false);
  };

  const handleExportXLSX = () => {
    exportToXLSX(filteredWorkers, `InformeRendimentos_${ano}.xlsx`);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredWorkers, `InformeRendimentos_${ano}.csv`);
  };

  const handleSinglePDF = (cpf: string) => {
    const worker = filteredWorkers.get(cpf);
    if (!worker) return;
    const pdf = generateInformeRendimentosPDF(worker, ano);
    pdf.save(`InformeRendimentos_${ano}_${cpf.replace(/\D/g, '')}.pdf`);
  };

  if (workers.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Nenhum dado importado</h3>
        <p className="text-sm text-slate-500 mt-2">Importe os XMLs primeiro na aba "Importar XMLs"</p>
      </div>
    );
  }

  // Summary stats
  let totalRendimentos = 0;
  let totalIRRF = 0;
  let totalFGTS = 0;
  for (const w of filteredWorkers.values()) {
    totalRendimentos += w.totalRendTrib;
    totalIRRF += w.totalIRRF;
    totalFGTS += w.totalFGTS;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios e Geração de PDFs</h2>
        <p className="text-sm text-slate-500 mt-1">Gere os informes de rendimentos em PDF e exporte relatórios para conferência.</p>
      </div>

      {/* Period Filter */}
      <div className="card">
        <div className="card-header">
          <FileText className="w-5 h-5 text-[#003366]" />
          <h3 className="font-semibold text-slate-700">Filtro de Período</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo</label>
              <select
                className="select"
                value={filter.tipo}
                onChange={(e) => setFilter({ ...filter, tipo: e.target.value as FilterOptions['tipo'] })}
              >
                <option value="anual">Anual</option>
                <option value="mensal">Mensal</option>
                <option value="periodo">Entre Períodos</option>
              </select>
            </div>
            {filter.tipo === 'anual' && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Ano</label>
                <select className="select" value={filter.ano || ''} onChange={(e) => setFilter({ ...filter, ano: e.target.value })}>
                  <option value="">Todos</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
            {filter.tipo === 'mensal' && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Mês</label>
                <select className="select" value={filter.mesInicio || ''} onChange={(e) => setFilter({ ...filter, mesInicio: e.target.value })}>
                  <option value="">Selecione</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
            {filter.tipo === 'periodo' && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">De</label>
                  <select className="select" value={filter.mesInicio || ''} onChange={(e) => setFilter({ ...filter, mesInicio: e.target.value })}>
                    <option value="">Início</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Até</label>
                  <select className="select" value={filter.mesFim || ''} onChange={(e) => setFilter({ ...filter, mesFim: e.target.value })}>
                    <option value="">Fim</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="stat-value text-[#003366]">{filteredWorkers.size}</span>
          <span className="stat-label">Trabalhadores</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-[#00a86b]">R$ {formatMoney(totalRendimentos)}</span>
          <span className="stat-label">Total Rendimentos</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-amber-600">R$ {formatMoney(totalIRRF)}</span>
          <span className="stat-label">Total IRRF</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-indigo-600">R$ {formatMoney(totalFGTS)}</span>
          <span className="stat-label">Total FGTS</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card">
        <div className="card-header">
          <Download className="w-5 h-5 text-[#003366]" />
          <h3 className="font-semibold text-slate-700">Ações de Exportação</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              className="btn btn-primary w-full justify-center py-4"
              onClick={handleGenerateAllPDFs}
              disabled={isGenerating || filteredWorkers.size === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando {progress.current}/{progress.total}...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Gerar Todos os PDFs (.zip)
                </>
              )}
            </button>
            <button
              className="btn btn-accent w-full justify-center py-4"
              onClick={handleExportXLSX}
              disabled={filteredWorkers.size === 0}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Exportar Excel (.xlsx)
            </button>
            <button
              className="btn btn-outline w-full justify-center py-4"
              onClick={handleExportCSV}
              disabled={filteredWorkers.size === 0}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Exportar CSV (;)
            </button>
          </div>
          {isGenerating && (
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-[#003366] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workers table with individual download */}
      <div className="card">
        <div className="card-header">
          <CheckCircle2 className="w-5 h-5 text-[#00a86b]" />
          <h3 className="font-semibold text-slate-700">
            Lista de Trabalhadores ({filteredWorkers.size})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>CPF</th>
                <th>Nome</th>
                <th>Rend. Tributáveis</th>
                <th>IRRF</th>
                <th>FGTS</th>
                <th>Prev. Oficial</th>
                <th>Pensão Alim.</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(filteredWorkers.values())
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((worker) => (
                  <tr key={worker.cpf}>
                    <td className="font-mono text-xs">{formatCPF(worker.cpf)}</td>
                    <td className="font-medium text-sm">{worker.nome}</td>
                    <td className="text-right font-mono text-sm">{formatMoney(worker.totalRendTrib)}</td>
                    <td className="text-right font-mono text-sm">{formatMoney(worker.totalIRRF)}</td>
                    <td className="text-right font-mono text-sm">{formatMoney(worker.totalFGTS)}</td>
                    <td className="text-right font-mono text-sm">{formatMoney(worker.totalPrevOficial + worker.totalContribPrev)}</td>
                    <td className="text-right font-mono text-sm">{formatMoney(worker.totalPensAlim)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSinglePDF(worker.cpf)}
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Importante:</strong> Os PDFs são gerados no formato do Informe de Rendimentos padrão da Receita Federal.
          O arquivo Excel/CSV contém todos os campos extraídos do S-5002 para conferência detalhada.
          O processamento é 100% local — nenhum dado sai do seu dispositivo.
        </div>
      </div>
    </div>
  );
}
