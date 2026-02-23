import { create } from 'zustand';
import type { S5002Event, WorkerSummary, FilterOptions } from '../tipos/s5002';
import { processXMLFiles, aggregateWorkerData, filterByPeriod } from '../utils/xmlParser';

interface ESocialState {
  // Raw data
  allEvents: S5002Event[];
  workers: Map<string, WorkerSummary>;

  // Processing stats
  totalFiles: number;
  totalS5002: number;
  totalSkipped: number;
  errors: string[];
  isProcessing: boolean;

  // Filters
  filter: FilterOptions;
  filteredWorkers: Map<string, WorkerSummary>;

  // Search
  searchCPF: string;
  selectedWorker: WorkerSummary | null;

  // Actions
  importFiles: (files: File[]) => Promise<void>;
  setFilter: (filter: FilterOptions) => void;
  applyFilter: () => void;
  searchByCPF: (cpf: string) => void;
  selectWorker: (cpf: string | null) => void;
  clearData: () => void;
  getAvailableYears: () => string[];
  getAvailableMonths: () => string[];
}

export const useESocialStore = create<ESocialState>((set, get) => ({
  allEvents: [],
  workers: new Map(),
  totalFiles: 0,
  totalS5002: 0,
  totalSkipped: 0,
  errors: [],
  isProcessing: false,
  filter: { tipo: 'anual', ano: new Date().getFullYear().toString() },
  filteredWorkers: new Map(),
  searchCPF: '',
  selectedWorker: null,

  importFiles: async (files: File[]) => {
    set({ isProcessing: true, errors: [] });

    try {
      const result = await processXMLFiles(files);
      const existingEvents = get().allEvents;
      const allEvents = [...existingEvents];

      // Add new events, avoiding duplicates by ID
      const existingIds = new Set(existingEvents.map(e => e.id));
      for (const [, worker] of result.workers) {
        for (const event of worker.eventos) {
          if (!existingIds.has(event.id)) {
            allEvents.push(event);
            existingIds.add(event.id);
          }
        }
      }

      const workers = aggregateWorkerData(allEvents);

      set({
        allEvents,
        workers,
        totalFiles: get().totalFiles + result.totalFiles,
        totalS5002: get().totalS5002 + result.totalS5002,
        totalSkipped: get().totalSkipped + result.totalSkipped,
        errors: [...get().errors, ...result.errors],
        isProcessing: false,
      });

      // Apply current filter
      get().applyFilter();
    } catch (error) {
      set({
        isProcessing: false,
        errors: [...get().errors, `Erro geral: ${(error as Error).message}`],
      });
    }
  },

  setFilter: (filter: FilterOptions) => {
    set({ filter });
    get().applyFilter();
  },

  applyFilter: () => {
    const { allEvents, filter } = get();
    const filtered = filterByPeriod(allEvents, filter.tipo, {
      mesInicio: filter.mesInicio,
      mesFim: filter.mesFim,
      ano: filter.ano,
    });
    const filteredWorkers = aggregateWorkerData(filtered);
    set({ filteredWorkers });
  },

  searchByCPF: (cpf: string) => {
    const clean = cpf.replace(/\D/g, '');
    set({ searchCPF: clean });

    if (clean.length >= 3) {
      const { filteredWorkers } = get();
      for (const [workerCPF, worker] of filteredWorkers) {
        if (workerCPF.includes(clean) || worker.nome.toLowerCase().includes(cpf.toLowerCase())) {
          set({ selectedWorker: worker });
          return;
        }
      }
    }
    set({ selectedWorker: null });
  },

  selectWorker: (cpf: string | null) => {
    if (!cpf) {
      set({ selectedWorker: null });
      return;
    }
    const { filteredWorkers } = get();
    const worker = filteredWorkers.get(cpf);
    set({ selectedWorker: worker || null });
  },

  clearData: () => {
    set({
      allEvents: [],
      workers: new Map(),
      filteredWorkers: new Map(),
      totalFiles: 0,
      totalS5002: 0,
      totalSkipped: 0,
      errors: [],
      searchCPF: '',
      selectedWorker: null,
    });
  },

  getAvailableYears: () => {
    const { allEvents } = get();
    const years = new Set<string>();
    for (const event of allEvents) {
      const year = event.ideEvento.perApur?.substring(0, 4);
      if (year) years.add(year);
    }
    return Array.from(years).sort().reverse();
  },

  getAvailableMonths: () => {
    const { allEvents } = get();
    const months = new Set<string>();
    for (const event of allEvents) {
      if (event.ideEvento.perApur) months.add(event.ideEvento.perApur);
    }
    return Array.from(months).sort();
  },
}));
