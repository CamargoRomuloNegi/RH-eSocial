// =====================================================
// Tipos completos para o evento S-5002 do eSocial
// Imposto de Renda Retido na Fonte por Trabalhador
// =====================================================

export interface IdeEvento {
  indRetif: string;
  nrRecibo?: string;
  perApur: string; // YYYY-MM
  tpAmb?: string;
  procEmi?: string;
  verProc?: string;
  nrRecArqBase?: string;
}

export interface IdeEmpregador {
  tpInsc: string;
  nrInsc: string;
  nmEmpregador?: string;
}

export interface IdeTrabalhador {
  cpfTrab: string;
  nmTrab?: string;
  dtNascto?: string;
}

export interface InfoDependente {
  cpfDep?: string;
  nmDep?: string;
  tpDep?: string;
  descrDep?: string;
  depIRRF?: string;
  vrDedDep?: number;
}

export interface InfoIRCR {
  tpCR: string;
  vrCR: number;
}

export interface InfoRRA {
  tpProcRRA?: string;
  nrProcRRA?: string;
  descRRA?: string;
  qtdMesesRRA?: number;
  cnpjOrigRecurso?: string;
  despProcJud?: {
    vlrDespCustas?: number;
    vlrDespAdvogados?: number;
  };
}

export interface InfoProcJud {
  nrProcJud?: string;
  indOrigRec?: string;
  desc?: string;
  cnpjOrigRecurso?: string;
}

export interface PenAlim {
  cpfDep?: string;
  nmDep?: string;
  vlrPensAlim?: number;
  dtNasctoDep?: string;
  nmBenef?: string;
  cpfBenef?: string;
}

export interface DedDepen {
  tpRend?: string;
  cpfDep?: string;
  vlrDedDep?: number;
}

export interface InfoFGTS {
  vrBcFGTSProcTrab?: number;
  vrBcFGTSSefip?: number;
  vrBcFGTSDecAnt?: number;
  vrBcFGTS?: number;
  vrFGTS?: number;
}

export interface InfoIR {
  vrRendTrib?: number;
  vrRendTrib13?: number;
  vrRendMoleGrave?: number;
  vrRendIsen65?: number;
  vrJurosMora?: number;
  vrRendIsenNTrib?: number;
  vrDedDepen?: number;
  vrRendIsento?: number;
  vrRendSusp?: number;
  vrDiarias?: number;
  vrAjudaCusto?: number;
  vrIndeniz?: number;
  vrReembMed?: number;
  vrPensAlim?: number;
  vrCompSind?: number;
  vrRendPJ?: number;
  vrPrevOficial?: number;
  vrPrevPriv?: number;
  vrFundoPensPriv?: number;
  vrFundoPensOficial?: number;
  vrParcIsentaApos65?: number;
  vrDiariasViagem?: number;
  vrIndenizSalarioMat?: number;
  vrBolsaEstagio?: number;
  vrAbonoFerias?: number;
  vrPartLucros?: number;
  vrRendSuspJud?: number;
  vrCompSindPatronal?: number;
  vrContribPrev?: number;
  vrSaudeTit?: number;
  // Complementary fields
  infoIRCR?: InfoIRCR[];
  infoRRA?: InfoRRA;
  infoProcJud?: InfoProcJud[];
  penAlim?: PenAlim[];
  dedDepen?: DedDepen[];
}

export interface BasesIRRF {
  tpValor?: string;
  valor?: number;
}

export interface IdeEstab {
  tpInsc?: string;
  nrInsc?: string;
  nmEstab?: string;
}

export interface PlanSaude {
  cnpjOper?: string;
  regANS?: string;
  vlrSaudeTit?: number;
}

export interface DmDev {
  ideDmDev: string;
  nrBeneficio?: string;
  perRef?: string;
  ideEstab?: IdeEstab;
  infoIR?: InfoIR;
  infoFGTS?: InfoFGTS;
  basesIRRF?: BasesIRRF[];
  infoRRA?: InfoRRA;
  infoProcJud?: InfoProcJud[];
  penAlim?: PenAlim[];
  dedDepen?: DedDepen[];
  infoDep?: InfoDependente[];
}

export interface InfoComplem {
  nmTrab?: string;
  dtNascto?: string;
  cpfBenef?: string;
  endereco?: {
    logradouro?: string;
    nrLograd?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    codMunic?: string;
  };
  ideDep?: InfoDependente[];
  planSaude?: PlanSaude[];
  infoIRCR?: InfoIRCR[];
}

export interface S5002Event {
  id: string;
  ideEvento: IdeEvento;
  ideEmpregador: IdeEmpregador;
  ideTrabalhador: IdeTrabalhador;
  infoComplem?: InfoComplem;
  dmDev: DmDev[];
  infoDep?: InfoDependente[];
  // Raw XML data for any fields not explicitly mapped
  rawData?: Record<string, unknown>;
}

// =====================================================
// Tipos agregados para relatórios
// =====================================================

export interface WorkerSummary {
  cpf: string;
  nome: string;
  dtNascto?: string;
  empregador: {
    tpInsc: string;
    nrInsc: string;
    nome?: string;
  };
  periodos: string[]; // YYYY-MM
  // Rendimentos Tributáveis
  totalRendTrib: number;
  totalRendTrib13: number;
  // Deduções
  totalPrevOficial: number;
  totalPrevPriv: number;
  totalDedDepen: number;
  totalPensAlim: number;
  totalCompSind: number;
  // IRRF
  totalIRRF: number;
  totalIRRF13: number;
  totalIRRFFerias: number;
  totalIRRFRRA: number;
  // Rendimentos Isentos
  totalRendIsen65: number;
  totalRendMoleGrave: number;
  totalDiarias: number;
  totalAjudaCusto: number;
  totalIndeniz: number;
  totalRendIsenNTrib: number;
  totalRendIsento: number;
  totalAbonoFerias: number;
  totalBolsaEstagio: number;
  totalPartLucros: number;
  totalParcIsentaApos65: number;
  // Tributação Exclusiva
  totalRendSusp: number;
  totalRendSuspJud: number;
  // FGTS
  totalBcFGTS: number;
  totalFGTS: number;
  totalBcFGTSProcTrab: number;
  totalBcFGTSSefip: number;
  totalBcFGTSDecAnt: number;
  // Plano de Saúde / Reembolso Médico
  totalReembMed: number;
  totalSaudeTit: number;
  // Outros
  totalJurosMora: number;
  totalRendPJ: number;
  totalContribPrev: number;
  totalFundoPensPriv: number;
  totalFundoPensOficial: number;
  // Códigos de Receita detalhados
  ircrDetails: InfoIRCR[];
  // Informações complementares
  infoComplem?: InfoComplem;
  dependentes: InfoDependente[];
  pensaoAlimenticia: PenAlim[];
  infoRRA?: InfoRRA[];
  // Eventos originais
  eventos: S5002Event[];
}

export interface FilterOptions {
  tipo: 'mensal' | 'periodo' | 'anual';
  mesInicio?: string; // YYYY-MM
  mesFim?: string; // YYYY-MM
  ano?: string; // YYYY
}

export interface ProcessingResult {
  totalFiles: number;
  totalS5002: number;
  totalSkipped: number;
  workers: Map<string, WorkerSummary>;
  errors: string[];
}
