# e-Social S-5002: Gerador de Informe de Rendimentos Offline

![Status](https://img.shields.io/badge/Status-Produção-success)
![Contexto](https://img.shields.io/badge/Contexto-RFB%20/%20e--Social-blue)
![Privacidade](https://img.shields.io/badge/Privacidade-100%25%20Offline-green)

Solução técnica avançada para leitura de eventos **S-5002** (Imposto de Renda Retido na Fonte por Trabalhador) do e-Social e consolidação automática em **Informes de Rendimentos** no formato oficial da Receita Federal do Brasil.

## 🚀 Diferenciais do Projeto
- **Segurança Absoluta**: O processamento é realizado integralmente no lado do cliente (browser). Nenhum dado sensível (CPF, Salário, Endereço) é enviado para servidores externos.
- **Consolidação Inteligente**: Agrega múltiplos arquivos XML mensais por CPF, separando automaticamente rendimentos de 13º salário, férias e RRA.
- **Escalabilidade local**: Capaz de processar centenas de arquivos XML simultaneamente em segundos.

## 🛠️ Tecnologias Utilizadas
- **React 18 + TypeScript**: Interface robusta e tipagem segura.
- **Zustand**: Gerenciamento de estado leve e eficiente.
- **Tailwind CSS**: Design moderno e responsivo.
- **jsPDF + AutoTable**: Motor de geração de PDFs de alta fidelidade.
- **JSZip**: Compactação de relatórios em lote.

## 📁 Estrutura do Projeto
- `/src/utils/xmlParser.ts`: Motor de parsing e lógica de agregação.
- `/src/utils/pdfGenerator.ts`: Templates de relatórios PDF.
- `/src/store/esocialStore.ts`: Central de dados e filtragem.
- `/src/pages`: Interfaces de Importação, Consulta e Relatórios.

## 📖 Guia de Uso
1. **Importação**: Arraste a pasta contendo os arquivos XML do e-Social para a área de upload.
2. **Filtragem**: Selecione o Ano-Calendário desejado. O sistema filtrará apenas os eventos pertinentes.
3. **Consulta**: Utilize a busca por CPF para visualizar os detalhes de um trabalhador específico.
4. **Exportação**:
   - Gere o PDF individual.
   - Baixe um arquivo ZIP contendo os relatórios de todos os trabalhadores listados.
   - Exporte dados consolidados para Excel (XLSX/CSV) para fins de auditoria.

## 📑 Glossário de Códigos de Receita (IRRF)
O sistema reconhece e categoriza os seguintes códigos `tpCR` do e-Social:
- `593656` / `188951`: Rendimentos do Trabalho (Mensal).
- `188856`: Gratificação Natalina (13º Salário).
- `056154`: Férias.
- `188758`: Rendimentos Recebidos Acumuladamente (RRA).

## 💻 Instalação (Desenvolvimento)
```bash
# Instalar dependências
npm install

# Iniciar ambiente de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

## 🔒 Segurança de Dados
Este projeto foi construído sob o princípio de **Privacy by Design**. Toda a manipulação de dados ocorre na memória volátil do navegador. Ao fechar a aba ou atualizar a página, os dados são permanentemente descartados.
