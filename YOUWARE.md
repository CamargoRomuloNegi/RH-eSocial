# eSocial S-5002 — Gerador de Relatórios de Rendimentos
Sistema completo para leitura de XMLs do eSocial (eventos S-5002) e geração de Relatórios de Rendimentos em PDF, com exportação para Excel/CSV.

## Status do projeto
- ** Tipo de projeto : ** React + TypeScript + Vite ( 100% lado do cliente )
- ** Ponto de entrada :** `src/main.tsx`
- ** Sistema de compilação** : Vite 7
- ** Estilização** : Tailwind CSS 3 + CSS personalizado

## Arquitetura

### Módulos principais
- **XML Parser** ( `src/utils/xmlParser.ts` ): Analisador completo do S-5002 com todos os campos do esquema
- **PDF Generator** ( `src/utils/pdfGenerator.ts` ): Geração de PDF no formato oficial do Informe de Rendimentos (RFB)
- **Excel Exporter** ( `src/utils/excelExporter.ts`): Exportação XLSX e CSV com separador `;`
- **Loja** ( `src/store/esocialStore.ts` ): Zustand loja para gerenciamento de estado

### Páginas
- **ImportPage** : Importação de XMLs via arrastar e soltar ou seleção de pasta
- **ConsultPage** : Consulta por CPF com visualização detalhada
- **ReportPage** : Geração global de PDFs ( ZIP ) e exportação de planilhas

### Tipos
- ** S5002 Types** ( `src/types/s5002.ts` ): Tipos TypeScript completos para todos os campos do evento S-5002

### Dependências principais
- `jspdf`  +  `jspdf-autotable` : Geração de PDF
- `xlsx` : Exportação para Excel/CSV
- `jszip` : Compactação ZIP para download em lote
- `file-saver` : Baixar arquivos
- `zustand` : Gerenciamento de estado
- `react-router-dom` : Navegação SPA
- `lucide-react` : Ícones

### Campos extraídos ( S-5002 )
Todos os campos do esquema XML eSocial S-5002 são analisados, incluindo:
- Identificação ( CPF, nome, CNPJ do empregador )
- Rendimento tributável ( vrRendTrib, vrRendTrib13 )
- Deduções ( prevOficial, prevPriv, dedDepen, pensAlim, compSind d )
- IRRF ( por códigos de receita: tpCR/vrCR )
- Rendimentos isentos ( 65+, doença, diárias, etc. )
- FGTS ( todas as bases )
Plano de saúde / reembolso médico - Plano de saúde / Reembolso médico
- Dependentes
- Pensão alimentícia ( pensao alimentícia )
- RRA ( rendimento acumulado )
- Processos judiciais

## Como funciona
1. O usuário importa arquivos XML ( arrastando e soltando ou selecionando uma pasta ).
2. O sistema analisa todos os arquivos, filtrando apenas os eventos S-5002.
3. Os dados são agregados por trabalhador ( CPF ).
4. O usuário pode filtrar por período ( mensal, intervalo, anual ).
5. Consultar trabalhadores individuais por meio do CPF
6. Gere PDFs individualmente ou em lote ( ZIP )
7. Exportar para Excel/CSV para auditoria