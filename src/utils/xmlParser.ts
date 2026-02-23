import type {
  S5002Event, IdeEvento, IdeEmpregador, IdeTrabalhador,
  DmDev, InfoIR, InfoFGTS, InfoIRCR, InfoRRA, InfoProcJud,
  PenAlim, DedDepen, InfoDependente, BasesIRRF, InfoComplem,
  IdeEstab, WorkerSummary, ProcessingResult, PlanSaude
} from '../tipos/s5002';

// =====================================================
// Utility functions for XML parsing
// =====================================================

function getTextContent(parent: Element, tagName: string): string {
  // Search in all namespaces
  const el = parent.getElementsByTagName(tagName)[0]
    || parent.querySelector(tagName);
  return el?.textContent?.trim() || '';
}

function getNumberContent(parent: Element, tagName: string): number {
  const text = getTextContent(parent, tagName);
  if (!text) return 0;
  return parseFloat(text.replace(',', '.')) || 0;
}

function getAllElements(parent: Element, tagName: string): Element[] {
  const elements = parent.getElementsByTagName(tagName);
  return Array.from(elements);
}

// =====================================================
// S-5002 XML Parser
// =====================================================

function parseIdeEvento(el: Element): IdeEvento {
  return {
    indRetif: getTextContent(el, 'indRetif'),
    nrRecibo: getTextContent(el, 'nrRecibo') || undefined,
    perApur: getTextContent(el, 'perApur'),
    tpAmb: getTextContent(el, 'tpAmb') || undefined,
    procEmi: getTextContent(el, 'procEmi') || undefined,
    verProc: getTextContent(el, 'verProc') || undefined,
    nrRecArqBase: getTextContent(el, 'nrRecArqBase') || undefined,
  };
}

function parseIdeEmpregador(el: Element): IdeEmpregador {
  return {
    tpInsc: getTextContent(el, 'tpInsc'),
    nrInsc: getTextContent(el, 'nrInsc'),
    nmEmpregador: getTextContent(el, 'nmRazao') || getTextContent(el, 'nmEmpregador') || undefined,
  };
}

function parseIdeTrabalhador(el: Element): IdeTrabalhador {
  return {
    cpfTrab: getTextContent(el, 'cpfTrab') || getTextContent(el, 'cpfBenef'),
    nmTrab: getTextContent(el, 'nmTrab') || undefined,
    dtNascto: getTextContent(el, 'dtNascto') || undefined,
  };
}

function parseInfoDep(el: Element): InfoDependente {
  return {
    cpfDep: getTextContent(el, 'cpfDep') || undefined,
    nmDep: getTextContent(el, 'nmDep') || getTextContent(el, 'nome') || undefined,
    tpDep: getTextContent(el, 'tpDep') || undefined,
    descrDep: getTextContent(el, 'descrDep') || undefined,
    depIRRF: getTextContent(el, 'depIRRF') || undefined,
    vrDedDep: getNumberContent(el, 'vrDedDep') || undefined,
  };
}

function parseInfoIRCR(el: Element): InfoIRCR {
  return {
    tpCR: getTextContent(el, 'tpCR') || getTextContent(el, 'CRMen'),
    vrCR: getNumberContent(el, 'vrCR') || getNumberContent(el, 'vlrCR') || getNumberContent(el, 'vlrCRMen'),
  };
}

function parseInfoRRA(el: Element): InfoRRA {
  const despEl = getAllElements(el, 'despProcJud')[0];
  return {
    tpProcRRA: getTextContent(el, 'tpProcRRA') || undefined,
    nrProcRRA: getTextContent(el, 'nrProcRRA') || undefined,
    descRRA: getTextContent(el, 'descRRA') || undefined,
    qtdMesesRRA: getNumberContent(el, 'qtdMesesRRA') || undefined,
    cnpjOrigRecurso: getTextContent(el, 'cnpjOrigRecurso') || undefined,
    despProcJud: despEl ? {
      vlrDespCustas: getNumberContent(despEl, 'vlrDespCustas') || undefined,
      vlrDespAdvogados: getNumberContent(despEl, 'vlrDespAdvogados') || undefined,
    } : undefined,
  };
}

function parseInfoProcJud(el: Element): InfoProcJud {
  return {
    nrProcJud: getTextContent(el, 'nrProcJud') || undefined,
    indOrigRec: getTextContent(el, 'indOrigRec') || undefined,
    desc: getTextContent(el, 'desc') || undefined,
    cnpjOrigRecurso: getTextContent(el, 'cnpjOrigRecurso') || undefined,
  };
}

function parsePenAlim(el: Element): PenAlim {
  return {
    cpfDep: getTextContent(el, 'cpfDep') || getTextContent(el, 'cpfBenef') || undefined,
    nmDep: getTextContent(el, 'nmDep') || getTextContent(el, 'nmBenef') || undefined,
    vlrPensAlim: getNumberContent(el, 'vlrPensAlim') || getNumberContent(el, 'vlrAlim') || undefined,
    dtNasctoDep: getTextContent(el, 'dtNasctoDep') || getTextContent(el, 'dtNascto') || undefined,
    nmBenef: getTextContent(el, 'nmBenef') || undefined,
    cpfBenef: getTextContent(el, 'cpfBenef') || undefined,
  };
}

function parseDedDepen(el: Element): DedDepen {
  return {
    tpRend: getTextContent(el, 'tpRend') || undefined,
    cpfDep: getTextContent(el, 'cpfDep') || undefined,
    vlrDedDep: getNumberContent(el, 'vlrDedDep') || undefined,
  };
}

function parseInfoIR(elements: Element[]): InfoIR {
  const infoIR: InfoIR = {
    vrRendTrib: 0,
    vrRendTrib13: 0,
    vrRendMoleGrave: 0,
    vrRendIsen65: 0,
    vrJurosMora: 0,
    vrRendIsenNTrib: 0,
    vrDedDepen: 0,
    vrRendIsento: 0,
    vrRendSusp: 0,
    vrDiarias: 0,
    vrAjudaCusto: 0,
    vrIndeniz: 0,
    vrReembMed: 0,
    vrPensAlim: 0,
    vrCompSind: 0,
    vrRendPJ: 0,
    vrPrevOficial: 0,
    vrPrevPriv: 0,
    vrFundoPensPriv: 0,
    vrFundoPensOficial: 0,
    vrParcIsentaApos65: 0,
    vrDiariasViagem: 0,
    vrIndenizSalarioMat: 0,
    vrBolsaEstagio: 0,
    vrAbonoFerias: 0,
    vrPartLucros: 0,
    vrRendSuspJud: 0,
    vrCompSindPatronal: 0,
    vrContribPrev: 0,
    infoIRCR: [],
    penAlim: [],
    dedDepen: [],
    infoProcJud: [],
  };

  for (const el of elements) {
    // Check for direct field names first (old version)
    const directFields: (keyof InfoIR)[] = [
      'vrRendTrib', 'vrRendTrib13', 'vrRendMoleGrave', 'vrRendIsen65', 'vrJurosMora',
      'vrRendIsenNTrib', 'vrDedDepen', 'vrRendIsento', 'vrRendSusp', 'vrDiarias',
      'vrAjudaCusto', 'vrIndeniz', 'vrReembMed', 'vrPensAlim', 'vrCompSind', 'vrRendPJ',
      'vrPrevOficial', 'vrPrevPriv', 'vrFundoPensPriv', 'vrFundoPensOficial',
      'vrParcIsentaApos65', 'vrDiariasViagem', 'vrIndenizSalarioMat', 'vrBolsaEstagio',
      'vrAbonoFerias', 'vrPartLucros', 'vrRendSuspJud', 'vrCompSindPatronal', 'vrContribPrev'
    ];

    for (const field of directFields) {
      const val = getNumberContent(el, field as string);
      if (val) (infoIR[field] as number) += val;
    }

    // Check for tpInfoIR and valor (Exhaustive Rigor v2 - User Table)
    const tpInfoIR = getTextContent(el, 'tpInfoIR');
    const valor = getNumberContent(el, 'valor');

    if (tpInfoIR && valor) {
      switch (tpInfoIR) {
        // RENDIMENTOS TRIBUTÁVEIS
        case '11': // Remuneração mensal
          infoIR.vrRendTrib! += valor; break;
        case '12': // 13º salário
          infoIR.vrRendTrib13! += valor; break;
        case '14': // PLR
          infoIR.vrPartLucros! += valor; break;

        // RETENÇÕES (IRRF)
        case '31': // IRRF - Remuneração mensal
          infoIR.infoIRCR!.push({ tpCR: 'GENERIC_MONTHLY_IR', vrCR: valor });
          break;
        case '32': // IRRF - 13º salário
          infoIR.infoIRCR!.push({ tpCR: 'GENERIC_13_IR', vrCR: valor });
          break;
        case '34': // IRRF - PLR
          infoIR.infoIRCR!.push({ tpCR: 'GENERIC_PLR_IR', vrCR: valor });
          break;

        // DEDUÇÕES - PREVIDÊNCIA E OUTROS
        case '41': // PSO - Mensal
        case '63': // Fundação - Mensal
        case '68': // CPSS - Mensal (Contribuição Previdenciária Servidor)
          infoIR.vrPrevOficial! += valor; break;
        case '42': // PSO - 13º
        case '64': // Fundação - 13º
          infoIR.vrPrevOficial! += valor; break;

        case '46': // Previdência privada - Salário mensal
        case '61': // FAPI - Mensal
          infoIR.vrPrevPriv! += valor; break;
        case '47': // Previdência privada - 13º
        case '62': // FAPI - 13º
          infoIR.vrPrevPriv! += valor; break;

        case '67': // Plano Saúde
          infoIR.vrSaudeTit! += valor; break;

        // PENSÃO ALIMENTÍCIA
        case '51': // Mensal
          infoIR.vrPensAlim! += valor; break;
        case '52': // 13º
          infoIR.vrPensAlim! += valor; break;
        case '54': // PLR
          infoIR.vrPensAlim! += valor; break;

        // ISENTOS E NÃO TRIBUTÁVEIS
        case '70': // Parcela isenta 65 anos - Mensal
        case '71': // Parcela isenta 65 anos - 13º
          infoIR.vrRendIsen65! += valor; break;
        case '72': // Diárias
          infoIR.vrDiarias! += valor; break;
        case '73': // Ajuda de custo
          infoIR.vrAjudaCusto! += valor; break;
        case '74': // Indenização e rescisão / PDV / Acidentes
          infoIR.vrIndeniz! += valor; break;
        case '75': // Abono pecuniário
          infoIR.vrAbonoFerias! += valor; break;
        case '76': // Moléstia grave - Mensal
        case '77': // Moléstia grave - 13º
          infoIR.vrRendMoleGrave! += valor; break;

        case '700': // Auxílio moradia
        case '701': // Transporte
        case '79': // Outras isenções
        case '7900': // Outros
          infoIR.vrRendIsento! += valor; break;

        // EXIGIBILIDADE SUSPENSA
        case '9011': case '9012': case '9014':
          infoIR.vrRendSusp! += valor; break;
        case '9031': case '9032': case '9034':
        case '9831': case '9832': case '9834':
          infoIR.vrRendSuspJud! += valor; break;
        case '9082': case '9083': // Compensação Judicial
          infoIR.vrRendSuspJud! += valor; break;
      }
    }

    // Process nested collections
    const ircrElements = getAllElements(el, 'infoIRCR');
    const totApurElements = getAllElements(el, 'totApurMen').concat(getAllElements(el, 'totApur'));
    const procJudElements = getAllElements(el, 'infoProcJud');
    const penAlimElements = getAllElements(el, 'penAlim');
    const dedDepenElements = getAllElements(el, 'dedDepen');

    if (ircrElements.length > 0) infoIR.infoIRCR!.push(...ircrElements.map(parseInfoIRCR));

    // Map totApurMen/totApur to infoIRCR
    if (totApurElements.length > 0) {
      for (const tae of totApurElements) {
        const tpCR = getTextContent(tae, 'CRMen') || getTextContent(tae, 'tpCR');
        const vrCR = getNumberContent(tae, 'vlrCRMen') || getNumberContent(tae, 'vlrCR') || getNumberContent(tae, 'vrCR');
        if (tpCR) infoIR.infoIRCR!.push({ tpCR, vrCR });
      }
    }

    if (procJudElements.length > 0) infoIR.infoProcJud!.push(...procJudElements.map(parseInfoProcJud));
    if (penAlimElements.length > 0) infoIR.penAlim!.push(...penAlimElements.map(parsePenAlim));
    if (dedDepenElements.length > 0) infoIR.dedDepen!.push(...dedDepenElements.map(parseDedDepen));

    const rraElements = getAllElements(el, 'infoRRA');
    if (rraElements.length > 0 && !infoIR.infoRRA) {
      infoIR.infoRRA = parseInfoRRA(rraElements[0]);
    }
  }

  return infoIR;
}

function parseInfoFGTS(el: Element): InfoFGTS {
  return {
    vrBcFGTSProcTrab: getNumberContent(el, 'vrBcFGTSProcTrab') || undefined,
    vrBcFGTSSefip: getNumberContent(el, 'vrBcFGTSSefip') || undefined,
    vrBcFGTSDecAnt: getNumberContent(el, 'vrBcFGTSDecAnt') || undefined,
    vrBcFGTS: getNumberContent(el, 'vrBcFGTS') || undefined,
    vrFGTS: getNumberContent(el, 'vrFGTS') || undefined,
  };
}

function parseBasesIRRF(el: Element): BasesIRRF {
  return {
    tpValor: getTextContent(el, 'tpValor') || undefined,
    valor: getNumberContent(el, 'valor') || undefined,
  };
}

function parseIdeEstab(el: Element): IdeEstab {
  return {
    tpInsc: getTextContent(el, 'tpInsc') || undefined,
    nrInsc: getTextContent(el, 'nrInsc') || undefined,
    nmEstab: getTextContent(el, 'nmEstab') || undefined,
  };
}

function parsePlanSaude(el: Element): PlanSaude {
  return {
    cnpjOper: getTextContent(el, 'cnpjOper') || undefined,
    regANS: getTextContent(el, 'regANS') || undefined,
    vlrSaudeTit: getNumberContent(el, 'vlrSaudeTit') || undefined,
  };
}

function parseInfoComplem(el: Element): InfoComplem {
  const endBrasil = getAllElements(el, 'endBrasil')[0] || getAllElements(el, 'endereco')[0];
  const ideDepElements = getAllElements(el, 'ideDep').concat(getAllElements(el, 'infoDep'));
  const planSaudeElements = getAllElements(el, 'planSaude');
  const infoIRCRElements = getAllElements(el, 'infoIRCR');

  return {
    nmTrab: getTextContent(el, 'nmTrab') || undefined,
    dtNascto: getTextContent(el, 'dtNascto') || undefined,
    cpfBenef: getTextContent(el, 'cpfBenef') || undefined,
    endereco: endBrasil ? {
      logradouro: getTextContent(endBrasil, 'dscLograd') || getTextContent(endBrasil, 'logradouro') || undefined,
      nrLograd: getTextContent(endBrasil, 'nrLograd') || undefined,
      bairro: getTextContent(endBrasil, 'bairro') || undefined,
      cidade: getTextContent(endBrasil, 'nmCidade') || getTextContent(endBrasil, 'cidade') || undefined,
      uf: getTextContent(endBrasil, 'uf') || undefined,
      cep: getTextContent(endBrasil, 'cep') || undefined,
      codMunic: getTextContent(endBrasil, 'codMunic') || undefined,
    } : undefined,
    ideDep: ideDepElements.length > 0 ? ideDepElements.map(parseInfoDep) : undefined,
    planSaude: planSaudeElements.length > 0 ? planSaudeElements.map(parsePlanSaude) : undefined,
    infoIRCR: infoIRCRElements.length > 0 ? infoIRCRElements.map(parseInfoIRCR) : undefined,
  };
}

function parseDmDev(el: Element): DmDev {
  const infoIRElements = getAllElements(el, 'infoIR');
  const infoFGTSElements = getAllElements(el, 'infoFGTS');
  const ideEstabEl = getAllElements(el, 'ideEstab')[0];
  const basesIrrfElements = getAllElements(el, 'basesIrrf');
  const infoRRAElements = getAllElements(el, 'infoRRA');
  const procJudElements = getAllElements(el, 'infoProcJud');
  const penAlimElements = getAllElements(el, 'penAlim');
  const dedDepenElements = getAllElements(el, 'dedDepen');
  const infoDepElements = getAllElements(el, 'infoDep').concat(getAllElements(el, 'ideDep'));

  return {
    ideDmDev: getTextContent(el, 'ideDmDev'),
    nrBeneficio: getTextContent(el, 'nrBeneficio') || undefined,
    perRef: getTextContent(el, 'perRef') || undefined,
    ideEstab: ideEstabEl ? parseIdeEstab(ideEstabEl) : undefined,
    infoIR: infoIRElements.length > 0 ? parseInfoIR(infoIRElements) : undefined,
    infoFGTS: infoFGTSElements.length > 0 ? parseInfoFGTS(infoFGTSElements[0]) : undefined,
    basesIRRF: basesIrrfElements.length > 0 ? basesIrrfElements.map(parseBasesIRRF) : undefined,
    infoRRA: infoRRAElements.length > 0 ? parseInfoRRA(infoRRAElements[0]) : undefined,
    infoProcJud: procJudElements.length > 0 ? procJudElements.map(parseInfoProcJud) : undefined,
    penAlim: penAlimElements.length > 0 ? penAlimElements.map(parsePenAlim) : undefined,
    dedDepen: dedDepenElements.length > 0 ? dedDepenElements.map(parseDedDepen) : undefined,
    infoDep: infoDepElements.length > 0 ? infoDepElements.map(parseInfoDep) : undefined,
  };
}

export function parseS5002XML(xmlString: string, fileName: string): S5002Event | null {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Check for parse errors
  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    console.warn(`Error parsing XML in file: ${fileName}`);
    return null;
  }

  // Find the S-5002 event element
  const evtIrrfBenef = xmlDoc.getElementsByTagName('evtIrrfBenef')[0]
    || xmlDoc.getElementsByTagName('evtBaseIRRF')[0];

  if (!evtIrrfBenef) {
    // Not an S-5002 event
    return null;
  }

  const ideEventoEl = getAllElements(evtIrrfBenef, 'ideEvento')[0];
  const ideEmpregadorEl = getAllElements(evtIrrfBenef, 'ideEmpregador')[0];
  const ideTrabalhadorEl = getAllElements(evtIrrfBenef, 'ideTrabalhador')[0];
  const infoComplemEl = getAllElements(evtIrrfBenef, 'infoComplem')[0]
    || getAllElements(evtIrrfBenef, 'infoIRComplem')[0]; // Handle S_01_02_00
  const dmDevElements = getAllElements(evtIrrfBenef, 'dmDev');
  const infoDepElements = getAllElements(evtIrrfBenef, 'infoDep')
    .concat(getAllElements(evtIrrfBenef, 'ideDep'));

  if (!ideEventoEl || !ideEmpregadorEl || !ideTrabalhadorEl) {
    console.warn(`Incomplete S-5002 event in file: ${fileName}`);
    return null;
  }

  const ideEvento = parseIdeEvento(ideEventoEl);
  const ideEmpregador = parseIdeEmpregador(ideEmpregadorEl);
  const ideTrabalhador = parseIdeTrabalhador(ideTrabalhadorEl);
  const infoComplem = infoComplemEl ? parseInfoComplem(infoComplemEl) : undefined;

  // Also check infoComplem for worker name
  if (!ideTrabalhador.nmTrab && infoComplem?.nmTrab) {
    ideTrabalhador.nmTrab = infoComplem.nmTrab;
  }
  if (!ideTrabalhador.dtNascto && infoComplem?.dtNascto) {
    ideTrabalhador.dtNascto = infoComplem.dtNascto;
  }

  const dmDev = dmDevElements.map(parseDmDev);
  const infoDep = infoDepElements.length > 0 ? infoDepElements.map(parseInfoDep) : undefined;

  // Also look for calcTrib and basesIrrf at event level
  const calcTribElements = getAllElements(evtIrrfBenef, 'calcTrib');
  const basesIrrfElements = getAllElements(evtIrrfBenef, 'basesIrrf');

  // If there are calcTrib or basesIrrf at event level, extract IRRF codes
  const eventLevelIRCR: InfoIRCR[] = [];
  for (const ct of calcTribElements) {
    const tpCR = getTextContent(ct, 'tpCR');
    const vrCR = getNumberContent(ct, 'vrCR');
    if (tpCR) eventLevelIRCR.push({ tpCR, vrCR });
  }
  for (const bi of basesIrrfElements) {
    const tpCR = getTextContent(bi, 'tpCR');
    const vrCR = getNumberContent(bi, 'vrCR');
    if (tpCR) eventLevelIRCR.push({ tpCR, vrCR });
  }

  // Attach event-level IRCR to first dmDev if exists
  if (eventLevelIRCR.length > 0 && dmDev.length > 0) {
    if (!dmDev[0].infoIR) dmDev[0].infoIR = {};
    dmDev[0].infoIR.infoIRCR = [
      ...(dmDev[0].infoIR.infoIRCR || []),
      ...eventLevelIRCR,
    ];
  }

  return {
    id: evtIrrfBenef.getAttribute('Id') || `${fileName}-${Date.now()}`,
    ideEvento,
    ideEmpregador,
    ideTrabalhador,
    infoComplem,
    dmDev,
    infoDep,
  };
}

// =====================================================
// Aggregate worker data from multiple S-5002 events
// =====================================================

function safeSum(...values: (number | undefined)[]): number {
  return values.reduce((acc, v) => (acc || 0) + (v || 0), 0) || 0;
}

export function aggregateWorkerData(events: S5002Event[]): Map<string, WorkerSummary> {
  const workers = new Map<string, WorkerSummary>();

  // 1. Deduplicate events: Keep only the latest event (highest nrRecibo) per CPF + Period
  const latestEventsMap = new Map<string, S5002Event>();

  events.forEach(event => {
    const cpfValue = event.ideTrabalhador.cpfTrab;
    const periodValue = event.ideEvento.perApur;
    if (!cpfValue || !periodValue) return;

    const key = `${cpfValue}_${periodValue}`;
    const existing = latestEventsMap.get(key);

    if (!existing) {
      latestEventsMap.set(key, event);
    } else {
      const currentRecibo = event.ideEvento.nrRecibo || '';
      const existingRecibo = existing.ideEvento.nrRecibo || '';
      // Simple string comparison for receipt numbers (usually works for eSocial versioning)
      if (currentRecibo > existingRecibo) {
        latestEventsMap.set(key, event);
      }
    }
  });

  const filteredEvents = Array.from(latestEventsMap.values());

  // 2. Aggregate the filtered (correct) events
  filteredEvents.forEach(event => {
    const cpf = event.ideTrabalhador.cpfTrab;
    let worker = workers.get(cpf);

    if (!worker) {
      worker = {
        cpf,
        nome: event.ideTrabalhador.nmTrab || event.infoComplem?.nmTrab || 'Não Informado',
        dtNascto: event.ideTrabalhador.dtNascto || event.infoComplem?.dtNascto,
        empregador: {
          tpInsc: event.ideEmpregador.tpInsc,
          nrInsc: event.ideEmpregador.nrInsc,
          nome: event.ideEmpregador.nmEmpregador,
        },
        periodos: [],
        totalRendTrib: 0,
        totalRendTrib13: 0,
        totalPrevOficial: 0,
        totalPrevPriv: 0,
        totalDedDepen: 0,
        totalPensAlim: 0,
        totalCompSind: 0,
        totalIRRF: 0,
        totalIRRF13: 0,
        totalIRRFFerias: 0,
        totalIRRFRRA: 0,
        totalRendIsen65: 0,
        totalRendMoleGrave: 0,
        totalDiarias: 0,
        totalAjudaCusto: 0,
        totalIndeniz: 0,
        totalRendIsenNTrib: 0,
        totalRendIsento: 0,
        totalAbonoFerias: 0,
        totalBolsaEstagio: 0,
        totalPartLucros: 0,
        totalParcIsentaApos65: 0,
        totalRendSusp: 0,
        totalRendSuspJud: 0,
        totalBcFGTS: 0,
        totalFGTS: 0,
        totalBcFGTSProcTrab: 0,
        totalBcFGTSSefip: 0,
        totalBcFGTSDecAnt: 0,
        totalReembMed: 0,
        totalSaudeTit: 0,
        totalJurosMora: 0,
        totalRendPJ: 0,
        totalContribPrev: 0,
        totalFundoPensPriv: 0,
        totalFundoPensOficial: 0,
        ircrDetails: [],
        infoComplem: event.infoComplem,
        dependentes: [],
        pensaoAlimenticia: [],
        infoRRA: [],
        eventos: [],
      };
      workers.set(cpf, worker);
    }

    // Update name/metadata if more complete in this event
    if (event.ideTrabalhador.nmTrab && worker.nome === 'Não Informado') {
      worker.nome = event.ideTrabalhador.nmTrab;
    }
    if (event.infoComplem?.nmTrab && worker.nome === 'Não Informado') {
      worker.nome = event.infoComplem.nmTrab;
    }

    if (event.ideEvento.perApur && !worker.periodos.includes(event.ideEvento.perApur)) {
      worker.periodos.push(event.ideEvento.perApur);
    }

    // Process each demonstration of values (dmDev)
    for (const dm of event.dmDev) {
      const ir = dm.infoIR;
      if (ir) {
        worker.totalRendTrib += ir.vrRendTrib || 0;
        worker.totalRendTrib13 += ir.vrRendTrib13 || 0;
        worker.totalPrevOficial += ir.vrPrevOficial || 0;
        worker.totalPrevPriv += ir.vrPrevPriv || 0;
        worker.totalDedDepen += ir.vrDedDepen || 0;
        worker.totalPensAlim += ir.vrPensAlim || 0;
        worker.totalCompSind += ir.vrCompSind || 0;
        worker.totalRendIsen65 += ir.vrRendIsen65 || 0;
        worker.totalRendMoleGrave += ir.vrRendMoleGrave || 0;
        worker.totalDiarias += safeSum(ir.vrDiarias, ir.vrDiariasViagem);
        worker.totalAjudaCusto += ir.vrAjudaCusto || 0;
        worker.totalIndeniz += safeSum(ir.vrIndeniz, ir.vrIndenizSalarioMat);
        worker.totalRendIsenNTrib += ir.vrRendIsenNTrib || 0;
        worker.totalRendIsento += ir.vrRendIsento || 0;
        worker.totalAbonoFerias += ir.vrAbonoFerias || 0;
        worker.totalBolsaEstagio += ir.vrBolsaEstagio || 0;
        worker.totalPartLucros += ir.vrPartLucros || 0;
        worker.totalParcIsentaApos65 += ir.vrParcIsentaApos65 || 0;
        worker.totalRendSusp += ir.vrRendSusp || 0;
        worker.totalRendSuspJud += ir.vrRendSuspJud || 0;
        worker.totalReembMed += ir.vrReembMed || 0;
        worker.totalSaudeTit += ir.vrSaudeTit || 0;
        worker.totalJurosMora += ir.vrJurosMora || 0;
        worker.totalRendPJ += ir.vrRendPJ || 0;
        worker.totalContribPrev += ir.vrContribPrev || 0;
        worker.totalFundoPensPriv += ir.vrFundoPensPriv || 0;
        worker.totalFundoPensOficial += ir.vrFundoPensOficial || 0;

        // IRRF Detail aggregation
        if (ir.infoIRCR) {
          for (const ircr of ir.infoIRCR) {
            worker.ircrDetails.push(ircr);
            const cr = ircr.tpCR;

            if (cr === '056107' || cr === 'GENERIC_MONTHLY_IR' || cr.startsWith('0561')) {
              worker.totalIRRF += ircr.vrCR;
              if (cr === '056107') worker.totalIRRFFerias += ircr.vrCR;
            }
            else if (cr.startsWith('1888') || cr === 'GENERIC_13_IR') {
              worker.totalIRRF13 += ircr.vrCR;
            }
            else if (cr.startsWith('1887') || cr === 'GENERIC_RRA_IR') {
              worker.totalIRRFRRA += ircr.vrCR;
            }
            else {
              if (!cr.startsWith('CP')) worker.totalIRRF += ircr.vrCR;
            }
          }
        }

        if (ir.penAlim) {
          worker.pensaoAlimenticia.push(...ir.penAlim);
        }
        if (ir.infoRRA) {
          // Handle if it's already an array or single object
          worker.infoRRA!.push(ir.infoRRA);
        }
      }

      // FGTS
      const fgts = dm.infoFGTS;
      if (fgts) {
        worker.totalBcFGTS += fgts.vrBcFGTS || 0;
        worker.totalFGTS += fgts.vrFGTS || 0;
        worker.totalBcFGTSProcTrab += fgts.vrBcFGTSProcTrab || 0;
        worker.totalBcFGTSSefip += fgts.vrBcFGTSSefip || 0;
        worker.totalBcFGTSDecAnt += fgts.vrBcFGTSDecAnt || 0;
      }

      // Collect lists
      if (dm.penAlim) worker.pensaoAlimenticia.push(...dm.penAlim);
      if (dm.infoDep) {
        dm.infoDep.forEach(dep => {
          if (!worker.dependentes.find(d => d.cpfDep === dep.cpfDep)) {
            worker.dependentes.push(dep);
          }
        });
      }
    }

    // Process event-level collections
    if (event.infoDep) {
      event.infoDep.forEach(dep => {
        if (!worker.dependentes.find(d => d.cpfDep === dep.cpfDep)) {
          worker.dependentes.push(dep);
        }
      });
    }

    if (event.infoComplem) {
      if (event.infoComplem.ideDep) {
        event.infoComplem.ideDep.forEach(dep => {
          if (!worker.dependentes.find(d => d.cpfDep === dep.cpfDep)) {
            worker.dependentes.push(dep);
          }
        });
      }
      if (event.infoComplem.planSaude) {
        event.infoComplem.planSaude.forEach(ps => {
          worker.totalSaudeTit += ps.vlrSaudeTit || 0;
        });
      }
    }

    worker.eventos.push(event);
  });

  // Final cleanup and sorting
  for (const worker of workers.values()) {
    worker.periodos.sort();
    // Deduplicate lists if needed
  }

  return workers;
}

// =====================================================
// Process multiple XML files
// =====================================================

export async function processXMLFiles(files: File[]): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    totalFiles: files.length,
    totalS5002: 0,
    totalSkipped: 0,
    workers: new Map(),
    errors: [],
  };

  const allEvents: S5002Event[] = [];

  for (const file of files) {
    try {
      const text = await file.text();
      const event = parseS5002XML(text, file.name);
      if (event) {
        allEvents.push(event);
        result.totalS5002++;
      } else {
        result.totalSkipped++;
      }
    } catch (error) {
      result.errors.push(`Erro ao processar ${file.name}: ${(error as Error).message}`);
      result.totalSkipped++;
    }
  }

  result.workers = aggregateWorkerData(allEvents);
  return result;
}

// =====================================================
// Filter workers by period
// =====================================================

export function filterByPeriod(
  events: S5002Event[],
  tipo: 'mensal' | 'periodo' | 'anual',
  params: { mesInicio?: string; mesFim?: string; ano?: string }
): S5002Event[] {
  return events.filter(event => {
    const perApur = event.ideEvento.perApur;
    if (!perApur) return false;

    switch (tipo) {
      case 'mensal':
        return perApur === params.mesInicio;
      case 'periodo':
        if (params.mesInicio && params.mesFim) {
          return perApur >= params.mesInicio && perApur <= params.mesFim;
        }
        return true;
      case 'anual':
        if (params.ano) {
          return perApur.startsWith(params.ano);
        }
        return true;
      default:
        return true;
    }
  });
}
