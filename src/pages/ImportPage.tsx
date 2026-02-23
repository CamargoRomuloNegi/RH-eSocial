import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Trash2, FolderOpen, Loader2, X } from 'lucide-react';
import { useESocialStore } from '../store/esocialStore';

export default function ImportPage() {
  const {
    importFiles, clearData, isProcessing,
    totalFiles, totalS5002, totalSkipped, errors,
    workers,
  } = useESocialStore();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const xmlFiles = Array.from(files).filter(f =>
      f.name.toLowerCase().endsWith('.xml')
    );
    if (xmlFiles.length === 0) return;
    await importFiles(xmlFiles);
  }, [importFiles]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const workerCount = workers.size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Importar Arquivos XML</h2>
        <p className="text-sm text-slate-500 mt-1">
          Selecione os arquivos XML do eSocial. O sistema processará automaticamente os eventos S-5002.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-[#00a86b] animate-spin" />
            <p className="text-lg font-semibold text-slate-700">Processando arquivos XML...</p>
            <p className="text-sm text-slate-500">Extraindo dados dos eventos S-5002</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#003366]/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#003366]" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              Arraste e solte os XMLs aqui
            </p>
            <p className="text-sm text-slate-500">
              ou clique para selecionar arquivos
            </p>
            <div className="flex gap-3 mt-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <FileText className="w-3.5 h-3.5" />
                Selecionar Arquivos
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Selecionar Pasta
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept=".xml"
          multiple
          {...({ webkitdirectory: 'true', directory: 'true' } as Record<string, string>)}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Stats */}
      {totalFiles > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          <div className="stat-card">
            <span className="stat-value text-[#003366]">{totalFiles}</span>
            <span className="stat-label">Arquivos Lidos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-[#00a86b]">{totalS5002}</span>
            <span className="stat-label">Eventos S-5002</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-amber-600">{totalSkipped}</span>
            <span className="stat-label">Ignorados</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-indigo-600">{workerCount}</span>
            <span className="stat-label">Trabalhadores</span>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-700">Avisos ({errors.length})</h3>
          </div>
          <div className="card-body max-h-40 overflow-y-auto space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-amber-700 flex items-start gap-2">
                <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {err}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Workers list preview */}
      {workerCount > 0 && (
        <div className="card animate-fade-in">
          <div className="card-header justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00a86b]" />
              <h3 className="font-semibold text-slate-700">
                Trabalhadores Identificados ({workerCount})
              </h3>
            </div>
            <button className="btn btn-danger btn-sm" onClick={clearData}>
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Dados
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CPF</th>
                  <th>Nome</th>
                  <th>Períodos</th>
                  <th>Eventos</th>
                  <th>Rend. Tributáveis</th>
                  <th>IRRF</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(workers.values())
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .slice(0, 20)
                  .map((worker) => (
                    <tr key={worker.cpf} className="animate-slide-in">
                      <td className="font-mono text-xs">{formatCPF(worker.cpf)}</td>
                      <td className="font-medium">{worker.nome}</td>
                      <td>
                        <span className="badge badge-info">{worker.periodos.length} meses</span>
                      </td>
                      <td className="text-center">{worker.eventos.length}</td>
                      <td className="text-right font-mono">
                        {formatMoney(worker.totalRendTrib)}
                      </td>
                      <td className="text-right font-mono">
                        {formatMoney(worker.totalIRRF)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {workerCount > 20 && (
              <div className="px-4 py-3 text-center text-xs text-slate-500">
                Mostrando 20 de {workerCount} trabalhadores. Use a aba "Consultar CPF" para buscar específicos.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '').padStart(11, '0');
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
