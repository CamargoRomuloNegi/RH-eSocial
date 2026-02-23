# Documentação de Componentes e Utilitários

## 1. Componentes de Interface (`src/pages`)

### `ImportPage`
- **Responsabilidade**: Ponto de entrada de dados.
- **Funcionalidades**:
  - Drag-and-drop de arquivos/pastas.
  - Integração com `useESocialStore` para disparar o processamento.
  - Feedback visual de progresso e erros de parsing.

### `ConsultPage`
- **Responsabilidade**: Visualização detalhada por trabalhador.
- **Funcionalidades**:
  - Busca reativa por CPF ou Nome.
  - Exibição de cards com totais anuais.
  - Visualização prévia dos dados que comporão o PDF.

### `ReportPage`
- **Responsabilidade**: Geração de saídas em massa.
- **Funcionalidades**:
  - Filtros de período (Mensal/Anual).
  - Geração de ZIP com todos os PDFs.
  - Exportação para Excel/CSV utilizando a biblioteca `xlsx`.

## 2. Utilitários Técnicos (`src/utils`)

### `xmlParser.ts`
- **`parseS5002XML`**: Converte string XML em objeto `S5002Event`. Valida se o XML pertence ao esquema esperado.
- **`aggregateWorkerData`**: Função crítica. Consolida múltiplos eventos em um único `WorkerSummary`. Lida com a soma de valores monetários e unificação de dependentes.

### `pdfGenerator.ts`
- **`generateInformeRendimentosPDF`**: Gera o PDF de uma página (ou mais se houver muitos dependentes/RRA). Segue o padrão estético da Receita Federal.
- **`formatCPF` / `formatCNPJ`**: Helper para máscaras de documentos.

### `excelExporter.ts`
- **Responsabilidade**: Transformar o `Map` de trabalhadores em planilhas tabulares.
- **Formatação**: Garante que valores numéricos sejam exportados corretamente para facilitar cálculos no Excel.

## 3. Gerenciamento de Dados (`src/store`)

### `esocialStore.ts`
- **State**: Mantém `allEvents` (bruto) e `filteredWorkers` (processado).
- **Actions**:
  - `importFiles`: Orquestra o parser e a agregação.
  - `applyFilter`: Re-processa os dados baseados na seleção do usuário (Ano/Mês).
