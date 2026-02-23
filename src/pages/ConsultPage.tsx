import React, { useState, useMemo } from 'react';
import { Search, User, Calendar, DollarSign, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useESocialStore } from '../store/esocialStore';
import { generateInformeRendimentosPDF } from '../utils/pdfGenerator';
import { saveAs } from 'file-saver';
import type { WorkerSummary, FilterOptions } from '../tipos/s5002';

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

function ValueLine({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  if (value === 0) return null;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-600">{label}</span>
      <span className={`text-sm font-mono font-semibold ${highlight ? 'text-[#003366]' : 'text-slate-800'}`}>
        R$ {formatMoney(value)}
      </span>
    </div>
  );
}

function Section({ title, children, icon: Icon, defaultOpen = true }: {
  title: string; children: React.ReactNode; icon: React.ElementType; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-4 animate-fade-in">
      <button
        className="card-header w-full hover:bg-slate-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Icon className="w-5 h-5 text-[#003366]" />
        <h3 className="font-semibold text-slate-700 flex-1 text-left">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="card-body">{children}</div>}
    </div>
  );
}

function WorkerDetail({ worker }: { worker: WorkerSummary }) {
  const { filter } = useESocialStore();
  const ano = filter.ano || worker.periodos[0]?.substring(0, 4) || new Date().getFullYear().toString();

  const handleDownloadPDF = () => {
    try {
      const pdf = generateInformeRendimentosPDF(worker, ano);
      const cleanCPF = worker.cpf.replace(/\D/g, '');
      const blob = pdf.output('blob');
      saveAs(blob, `InformeRendimentos_${ano}_${cleanCPF}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF individual:', error);
      alert('Ocorreu um erro ao gerar o PDF. Verifique os dados do trabalhador.');
    }
  };

  const cnpj = worker.empregador.tpInsc === '1'
    ? formatCNPJ(worker.empregador.nrInsc)
    : worker.empregador.nrInsc;

  return (
    <div className="space-y-4">
      {/* Worker Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004d99] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{worker.nome}</h3>
                <p className="text-blue-200 text-sm font-mono">{formatCPF(worker.cpf)}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-blue-200">
              <span>Empregador: {worker.empregador.nome || cnpj}</span>
              <span>•</span>
              <span>{worker.periodos.length} competências</span>
              <span>•</span>
              <span>{worker.eventos.length} eventos</span>
            </div>
          </div>
          <button className="btn bg-white/20 text-white hover:bg-white/30 text-xs" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
        </div>
      </div>

      {/* Rendimentos Tributáveis */}
      <Section title="Rendimentos Tributáveis, Deduções e IRRF" icon={DollarSign}>
        <ValueLine label="Total dos Rendimentos (incl. férias)" value={worker.totalRendTrib} highlight />
        <ValueLine label="13º Salário" value={worker.totalRendTrib13} highlight />
        <div className="h-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Deduções</p>
        <ValueLine label="Contribuição Previdenciária Oficial" value={worker.totalPrevOficial + worker.totalContribPrev} />
        <ValueLine label="Previdência Complementar / Privada" value={worker.totalPrevPriv + worker.totalFundoPensPriv + worker.totalFundoPensOficial} />
        <ValueLine label="Pensão Alimentícia" value={worker.totalPensAlim} />
        <ValueLine label="Dedução de Dependentes" value={worker.totalDedDepen} />
        <ValueLine label="Contribuição Sindical" value={worker.totalCompSind} />
        <div className="h-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Imposto Retido</p>
        <ValueLine label="IRRF sobre Rendimentos" value={worker.totalIRRF} highlight />
        <ValueLine label="IRRF sobre 13º Salário" value={worker.totalIRRF13} />
        <ValueLine label="IRRF sobre Férias" value={worker.totalIRRFFerias} />
        <ValueLine label="IRRF sobre RRA" value={worker.totalIRRFRRA} />
      </Section>

      {/* Rendimentos Isentos */}
      <Section title="Rendimentos Isentos e Não Tributáveis" icon={FileText} defaultOpen={false}>
        <ValueLine label="Parcela isenta aposentadoria (65+)" value={worker.totalRendIsen65 + worker.totalParcIsentaApos65} />
        <ValueLine label="Diárias e ajuda de custo" value={worker.totalDiarias + worker.totalAjudaCusto} />
        <ValueLine label="Moléstia grave" value={worker.totalRendMoleGrave} />
        <ValueLine label="Participação nos Lucros" value={worker.totalPartLucros} />
        <ValueLine label="Bolsa de estágio" value={worker.totalBolsaEstagio} />
        <ValueLine label="Indenizações / Abono de férias" value={worker.totalIndeniz + worker.totalAbonoFerias} />
        <ValueLine label="Outros isentos" value={worker.totalRendIsenNTrib + worker.totalRendIsento} />
      </Section>

      {/* Tributação Exclusiva */}
      <Section title="Rendimentos com Tributação Exclusiva" icon={DollarSign} defaultOpen={false}>
        <ValueLine label="Rendimentos tributação exclusiva" value={worker.totalRendSusp} />
        <ValueLine label="Rendimentos trib. exclusiva - Judicial" value={worker.totalRendSuspJud} />
        <ValueLine label="Juros de mora" value={worker.totalJurosMora} />
      </Section>

      {/* FGTS */}
      <Section title="Informações de FGTS" icon={Calendar} defaultOpen={false}>
        <ValueLine label="Base de FGTS" value={worker.totalBcFGTS} />
        <ValueLine label="FGTS depositado" value={worker.totalFGTS} />
        <ValueLine label="Base FGTS - Processo Trabalhista" value={worker.totalBcFGTSProcTrab} />
        <ValueLine label="Base FGTS - SEFIP" value={worker.totalBcFGTSSefip} />
        <ValueLine label="Base FGTS - Decl. Anterior" value={worker.totalBcFGTSDecAnt} />
      </Section>

      {/* Plano de Saúde */}
      {worker.totalReembMed > 0 && (
        <Section title="Plano de Saúde / Reembolso Médico" icon={FileText} defaultOpen={false}>
          <ValueLine label="Total reembolso médico" value={worker.totalReembMed} />
        </Section>
      )}

      {/* Dependentes */}
      {worker.dependentes.length > 0 && (
        <Section title={`Dependentes (${worker.dependentes.length})`} icon={User} defaultOpen={false}>
          {worker.dependentes.map((dep, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
              <div>
                <span className="text-xs font-medium text-slate-700">{dep.nmDep || dep.descrDep || 'N/A'}</span>
                {dep.cpfDep && (
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">{formatCPF(dep.cpfDep)}</span>
                )}
              </div>
              {dep.vrDedDep !== undefined && (
                <span className="text-xs font-mono text-slate-600">R$ {formatMoney(dep.vrDedDep)}</span>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Pensão */}
      {worker.pensaoAlimenticia.length > 0 && (
        <Section title={`Pensão Alimentícia (${worker.pensaoAlimenticia.length})`} icon={DollarSign} defaultOpen={false}>
          {worker.pensaoAlimenticia.map((pen, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-700">{pen.nmDep || pen.cpfDep || 'N/A'}</span>
              <span className="text-xs font-mono font-semibold text-slate-800">
                R$ {formatMoney(pen.vlrPensAlim || 0)}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* IRRF Detalhado */}
      {worker.ircrDetails.length > 0 && (
        <Section title="Códigos de Receita (IRRF Detalhado)" icon={FileText} defaultOpen={false}>
          {(() => {
            const crMap = new Map<string, number>();
            for (const cr of worker.ircrDetails) {
              crMap.set(cr.tpCR, (crMap.get(cr.tpCR) || 0) + cr.vrCR);
            }
            return Array.from(crMap).map(([tpCR, vrCR]) => (
              <ValueLine key={tpCR} label={`Código ${tpCR}`} value={vrCR} />
            ));
          })()}
        </Section>
      )}
    </div>
  );
}

export default function ConsultPage() {
  const { filteredWorkers, filter, setFilter, getAvailableYears, getAvailableMonths, workers } = useESocialStore();
  const [search, setSearch] = useState('');
  const [selectedCPF, setSelectedCPF] = useState<string | null>(null);

  const years = getAvailableYears();
  const months = getAvailableMonths();

  const results = useMemo(() => {
    if (!search) return [];
    const clean = search.replace(/\D/g, '');
    const lower = search.toLowerCase();
    return Array.from(filteredWorkers.values()).filter(w =>
      w.cpf.includes(clean) || w.nome.toLowerCase().includes(lower)
    ).slice(0, 50);
  }, [search, filteredWorkers]);

  const selectedWorker = selectedCPF ? filteredWorkers.get(selectedCPF) : null;

  if (workers.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Search className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Nenhum dado importado</h3>
        <p className="text-sm text-slate-500 mt-2">Importe os XMLs primeiro na aba "Importar XMLs"</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Consultar por CPF</h2>
        <p className="text-sm text-slate-500 mt-1">Busque pelo CPF ou nome do trabalhador para visualizar o informe completo.</p>
      </div>

      {/* Period Filter */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de Período</label>
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
            <div className="flex items-end">
              <span className="badge badge-success text-xs">
                {filteredWorkers.size} trabalhadores no filtro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          className="input pl-12 text-base"
          placeholder="Digite o CPF ou nome do trabalhador..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedCPF(null); }}
        />
      </div>

      {/* Search Results */}
      {search && !selectedCPF && (
        <div className="card">
          <div className="card-body p-0">
            {results.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Nenhum trabalhador encontrado para "{search}"
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.map(w => (
                  <button
                    key={w.cpf}
                    className="w-full flex items-center gap-4 px-6 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                    onClick={() => { setSelectedCPF(w.cpf); }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#003366]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{w.nome}</p>
                      <p className="text-xs text-slate-500 font-mono">{formatCPF(w.cpf)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold text-[#003366]">
                        R$ {formatMoney(w.totalRendTrib)}
                      </p>
                      <p className="text-[10px] text-slate-400">{w.periodos.length} meses</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Worker Detail */}
      {selectedWorker && <WorkerDetail worker={selectedWorker} />}
    </div>
  );
}
