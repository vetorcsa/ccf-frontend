import type {
  BatchAnalysisDivergence,
  BatchAnalysisDocument,
  BatchAnalysisFiscalNote,
  BatchAnalysisResponse,
  BatchRecord,
  BatchSummary,
} from "../services/batches.service";
import type { FileRecord } from "../services/files.service";

export const DEMO_BATCH_ID = "demo-supermercado-padrao";
export const DEMO_BATCH_NAME = "Supermercado Padrão";
export const FISCAL_DEMO_BATCH_ID = "demo-monitoramento-st-cbd";
export const FISCAL_DEMO_BATCH_NAME = "Monitoramento ST - CIA Brasileira de Distribuição";
export const CONSTRUCTION_DEMO_BATCH_ID = "demo-monitoramento-st-construmax";
export const CONSTRUCTION_DEMO_BATCH_NAME = "Monitoramento ST - Construmax Atacadista";
export const ITATIAIA_DEMO_BATCH_ID = "demo-monitoramento-st-serra-azul";
export const ITATIAIA_DEMO_BATCH_NAME = "Monitoramento ST - Serra Azul Materiais";
export const GLASS_DEMO_BATCH_ID = "demo-monitoramento-st-horizonte-vidros";
export const GLASS_DEMO_BATCH_NAME = "Monitoramento ST - Horizonte Vidros";

const DEMO_CREATED_AT = "2025-02-03T13:45:00.000Z";
const DEMO_UPDATED_AT = "2025-02-03T16:20:00.000Z";
const FISCAL_DEMO_CREATED_AT = "2025-03-10T10:20:00.000Z";
const FISCAL_DEMO_UPDATED_AT = "2025-03-10T15:40:00.000Z";
const CONSTRUCTION_DEMO_CREATED_AT = "2025-04-08T09:35:00.000Z";
const CONSTRUCTION_DEMO_UPDATED_AT = "2025-04-08T14:55:00.000Z";
const ITATIAIA_DEMO_CREATED_AT = "2025-04-16T08:50:00.000Z";
const ITATIAIA_DEMO_UPDATED_AT = "2025-04-16T13:25:00.000Z";
const GLASS_DEMO_CREATED_AT = "2025-04-23T09:10:00.000Z";
const GLASS_DEMO_UPDATED_AT = "2025-04-23T12:45:00.000Z";

export const DEMO_BATCH_RECORD: BatchRecord = {
  id: DEMO_BATCH_ID,
  name: DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: DEMO_CREATED_AT,
  updatedAt: DEMO_UPDATED_AT,
  totalFiles: 600,
  uploadedBy: {
    id: "demo-user-auditoria",
    name: "Admin",
    email: "admin@ccf.demo",
  },
};

export const DEMO_BATCH_SUMMARY: BatchSummary = {
  id: DEMO_BATCH_ID,
  name: DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: DEMO_CREATED_AT,
  updatedAt: DEMO_UPDATED_AT,
};

export const FISCAL_DEMO_BATCH_RECORD: BatchRecord = {
  id: FISCAL_DEMO_BATCH_ID,
  name: FISCAL_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: FISCAL_DEMO_CREATED_AT,
  updatedAt: FISCAL_DEMO_UPDATED_AT,
  totalFiles: 18240,
  uploadedBy: {
    id: "demo-user-fisco",
    name: "Admin",
    email: "admin@ccf.demo",
  },
};

export const FISCAL_DEMO_BATCH_SUMMARY: BatchSummary = {
  id: FISCAL_DEMO_BATCH_ID,
  name: FISCAL_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: FISCAL_DEMO_CREATED_AT,
  updatedAt: FISCAL_DEMO_UPDATED_AT,
};

export const CONSTRUCTION_DEMO_BATCH_RECORD: BatchRecord = {
  id: CONSTRUCTION_DEMO_BATCH_ID,
  name: CONSTRUCTION_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: CONSTRUCTION_DEMO_CREATED_AT,
  updatedAt: CONSTRUCTION_DEMO_UPDATED_AT,
  totalFiles: 27480,
  uploadedBy: {
    id: "demo-user-monitoramento",
    name: "Admin",
    email: "admin@ccf.demo",
  },
};

export const CONSTRUCTION_DEMO_BATCH_SUMMARY: BatchSummary = {
  id: CONSTRUCTION_DEMO_BATCH_ID,
  name: CONSTRUCTION_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: CONSTRUCTION_DEMO_CREATED_AT,
  updatedAt: CONSTRUCTION_DEMO_UPDATED_AT,
};

export const ITATIAIA_DEMO_BATCH_RECORD: BatchRecord = {
  id: ITATIAIA_DEMO_BATCH_ID,
  name: ITATIAIA_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: ITATIAIA_DEMO_CREATED_AT,
  updatedAt: ITATIAIA_DEMO_UPDATED_AT,
  totalFiles: 19860,
  uploadedBy: {
    id: "demo-user-monitoramento",
    name: "Admin",
    email: "admin@ccf.demo",
  },
};

export const ITATIAIA_DEMO_BATCH_SUMMARY: BatchSummary = {
  id: ITATIAIA_DEMO_BATCH_ID,
  name: ITATIAIA_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: ITATIAIA_DEMO_CREATED_AT,
  updatedAt: ITATIAIA_DEMO_UPDATED_AT,
};

export const GLASS_DEMO_BATCH_RECORD: BatchRecord = {
  id: GLASS_DEMO_BATCH_ID,
  name: GLASS_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: GLASS_DEMO_CREATED_AT,
  updatedAt: GLASS_DEMO_UPDATED_AT,
  totalFiles: 6420,
  uploadedBy: {
    id: "demo-user-monitoramento",
    name: "Admin",
    email: "admin@ccf.demo",
  },
};

export const GLASS_DEMO_BATCH_SUMMARY: BatchSummary = {
  id: GLASS_DEMO_BATCH_ID,
  name: GLASS_DEMO_BATCH_NAME,
  status: "COMPLETED_WITH_ERRORS",
  createdAt: GLASS_DEMO_CREATED_AT,
  updatedAt: GLASS_DEMO_UPDATED_AT,
};

export type DemoCompanyInfo = {
  corporateName: string;
  tradeName: string;
  taxRegistration: string;
  address: string;
  phone: string;
  mainActivity: string;
  declaratoryAct: string;
};

const DEMO_COMPANY_INFO_BY_BATCH_ID: Record<string, DemoCompanyInfo> = {
  [DEMO_BATCH_ID]: {
    corporateName: "Supermercado Padrão Ltda.",
    tradeName: "Supermercado Padrão",
    taxRegistration: "CNPJ 12.345.678/0001-90 / CFDF 07.123.456/001-99",
    address: "QS 01 Rua 210, Lote 12, Brasília - DF",
    phone: "(61) 3333-0101",
    mainActivity: "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios",
    declaratoryAct: "Ato Declaratório nº 10/2020",
  },
  [FISCAL_DEMO_BATCH_ID]: {
    corporateName: "Companhia Brasileira de Distribuição",
    tradeName: "CIA Brasileira de Distribuição",
    taxRegistration: "CNPJ 47.508.411/1521-77 / CFDF 07.987.654/001-20",
    address: "SIA Trecho 03, Lote 625, Brasília - DF",
    phone: "(61) 3312-4500",
    mainActivity: "Comércio atacadista e varejista de mercadorias em geral",
    declaratoryAct: "Ato Declaratório nº 10/2020",
  },
  [CONSTRUCTION_DEMO_BATCH_ID]: {
    corporateName: "Construmax Atacadista da Construção Ltda.",
    tradeName: "Construmax Atacadista",
    taxRegistration: "CNPJ 11.223.344/0001-55 / CFDF 07.433.931/001-87",
    address: "SIA Trecho 02, Lote 930, Guará - DF",
    phone: "(61) 3344-2700",
    mainActivity: "Comércio atacadista de ferragens, ferramentas e materiais de construção",
    declaratoryAct: "Ato Declaratório nº 06/2013",
  },
  [ITATIAIA_DEMO_BATCH_ID]: {
    corporateName: "Serra Azul Comércio de Materiais para Construção Ltda.",
    tradeName: "Serra Azul Materiais",
    taxRegistration: "CNPJ 23.456.789/0001-12 / CFDF 07.457.706/001-95",
    address: "ADE Conjunto 08, Lote 18, Águas Claras - DF",
    phone: "(61) 3355-8200",
    mainActivity: "Comércio atacadista de materiais de construção em geral",
    declaratoryAct: "Ato Declaratório nº 20/2013",
  },
  [GLASS_DEMO_BATCH_ID]: {
    corporateName: "Horizonte Vidros Planos Ltda.",
    tradeName: "Horizonte Vidros",
    taxRegistration: "CNPJ 34.567.890/0001-45 / CFDF 07.315.882/003-22",
    address: "SCIA Quadra 14, Conjunto 07, Lote 04, Brasília - DF",
    phone: "(61) 3366-4100",
    mainActivity: "Comércio atacadista de vidros, espelhos e vitrais",
    declaratoryAct: "Ato Declaratório nº 001/2014",
  },
};

const DIVERGENCE_DEFINITIONS: Array<{
  code: string;
  title: string;
  description: string;
  severity: "WARNING" | "ERROR" | "CRITICAL";
  documentsCount: number;
  occurrences: number;
}> = [
  {
    code: "INPUT_OUTPUT_TAX_TREATMENT_MISMATCH",
    title: "Tratamento fiscal incompatível entre entrada e saída",
    description:
      "Itens comprados com tratamento fiscal de ST foram vendidos com tributação própria, sem evidência de alteração fiscal válida.",
    severity: "CRITICAL",
    documentsCount: 596,
    occurrences: 1842,
  },
  {
    code: "NCM_INCOMPATIBLE",
    title: "NCM incompatível entre documentos",
    description: "Produtos equivalentes apresentam NCM diferente entre XMLs de entrada e saída.",
    severity: "WARNING",
    documentsCount: 428,
    occurrences: 1306,
  },
  {
    code: "MISSING_CEST",
    title: "Ausência de CEST",
    description: "Itens sujeitos à substituição tributária foram emitidos sem CEST informado.",
    severity: "WARNING",
    documentsCount: 391,
    occurrences: 1184,
  },
  {
    code: "INVALID_CEST_NCM_COMBINATION",
    title: "Combinação NCM/CEST inválida",
    description: "Foram identificadas combinações de NCM e CEST incompatíveis com a tabela fiscal vigente.",
    severity: "ERROR",
    documentsCount: 244,
    occurrences: 734,
  },
  {
    code: "INVALID_ANNEX_ITEM",
    title: "Item fora do anexo fiscal esperado",
    description: "Produtos foram classificados em anexo fiscal divergente do tratamento aplicado na operação.",
    severity: "WARNING",
    documentsCount: 188,
    occurrences: 492,
  },
  {
    code: "INVALID_CFOP_FOR_OPERATION",
    title: "CFOP incompatível com a operação",
    description: "CFOP utilizado não corresponde à natureza da operação identificada no documento fiscal.",
    severity: "ERROR",
    documentsCount: 267,
    occurrences: 821,
  },
  {
    code: "CFOP_ST_MISMATCH",
    title: "CFOP incompatível com ST",
    description: "Operações com indício de substituição tributária foram emitidas com CFOP de tributação própria.",
    severity: "WARNING",
    documentsCount: 316,
    occurrences: 1005,
  },
  {
    code: "OPERATION_NATURE_MISMATCH",
    title: "Natureza da operação divergente",
    description: "A natureza da operação declarada não é compatível com os códigos fiscais utilizados nos itens.",
    severity: "WARNING",
    documentsCount: 203,
    occurrences: 588,
  },
  {
    code: "ICMS_CODE_REGIME_MISMATCH",
    title: "Código de ICMS incompatível com regime",
    description: "CST/CSOSN aplicado não corresponde ao regime tributário esperado para o contribuinte.",
    severity: "ERROR",
    documentsCount: 351,
    occurrences: 1097,
  },
  {
    code: "ICMS_CODE_PRODUCT_MISMATCH",
    title: "Código de ICMS incompatível com produto",
    description: "O código de ICMS aplicado diverge do tratamento previsto para NCM/CEST do item.",
    severity: "WARNING",
    documentsCount: 372,
    occurrences: 1219,
  },
  {
    code: "PIS_COFINS_MISMATCH",
    title: "Divergência de PIS/COFINS",
    description: "CST e valores de PIS/COFINS divergem entre compras e saídas fiscalmente relacionadas.",
    severity: "WARNING",
    documentsCount: 294,
    occurrences: 887,
  },
  {
    code: "PIS_COFINS_ZERO_UNEXPECTED",
    title: "PIS/COFINS zerado sem justificativa",
    description: "Itens tributáveis foram emitidos com base e valores zerados sem regra fiscal justificando o tratamento.",
    severity: "WARNING",
    documentsCount: 271,
    occurrences: 752,
  },
  {
    code: "INTERNAL_RATE_MISMATCH",
    title: "Alíquota interna divergente",
    description: "Alíquota de ICMS aplicada difere da alíquota interna esperada para UF e produto.",
    severity: "ERROR",
    documentsCount: 337,
    occurrences: 963,
  },
  {
    code: "MISSING_BASE_REDUCTION",
    title: "Redução de base ausente",
    description: "Operações elegíveis à redução de base foram emitidas sem aplicação da redução prevista.",
    severity: "WARNING",
    documentsCount: 184,
    occurrences: 421,
  },
  {
    code: "UNEXPECTED_BASE_REDUCTION",
    title: "Redução de base indevida",
    description: "Redução de base aplicada sem regra fiscal vigente para o produto ou operação.",
    severity: "ERROR",
    documentsCount: 156,
    occurrences: 374,
  },
  {
    code: "BASE_REDUCTION_RATE_MISMATCH",
    title: "Percentual de redução divergente",
    description: "Percentual de redução de base informado diverge do percentual previsto na regra fiscal.",
    severity: "WARNING",
    documentsCount: 143,
    occurrences: 331,
  },
  {
    code: "MISSING_ST_TREATMENT",
    title: "Tratamento de ST ausente",
    description: "Itens com indício de ST na entrada foram vendidos sem tratamento fiscal de substituição tributária.",
    severity: "CRITICAL",
    documentsCount: 489,
    occurrences: 1511,
  },
  {
    code: "UNEXPECTED_ST_TREATMENT",
    title: "Tratamento de ST indevido",
    description: "Substituição tributária aplicada a itens sem previsão fiscal válida no cenário analisado.",
    severity: "ERROR",
    documentsCount: 177,
    occurrences: 456,
  },
  {
    code: "MVA_MISMATCH",
    title: "MVA divergente",
    description: "Margem de Valor Agregado usada na base de ST diverge da regra aplicável ao produto.",
    severity: "WARNING",
    documentsCount: 219,
    occurrences: 698,
  },
  {
    code: "ST_BASE_MISMATCH",
    title: "Base de cálculo de ST divergente",
    description: "Base de cálculo de ICMS-ST não confere com a recomposição esperada pelos itens da operação.",
    severity: "ERROR",
    documentsCount: 283,
    occurrences: 904,
  },
  {
    code: "ICMS_ST_VALUE_MISMATCH",
    title: "Valor de ICMS-ST divergente",
    description: "Valor de ICMS-ST calculado difere do valor esperado a partir de base, MVA e alíquota aplicáveis.",
    severity: "ERROR",
    documentsCount: 247,
    occurrences: 782,
  },
  {
    code: "MISSING_CREDIT_REVERSAL",
    title: "Estorno de crédito ausente",
    description: "Operações que exigem estorno de crédito não apresentaram registro fiscal correspondente.",
    severity: "WARNING",
    documentsCount: 198,
    occurrences: 514,
  },
  {
    code: "UNEXPECTED_CREDIT_REVERSAL",
    title: "Estorno de crédito indevido",
    description: "Estorno de crédito identificado sem vínculo com regra fiscal ou operação que o justifique.",
    severity: "WARNING",
    documentsCount: 82,
    occurrences: 126,
  },
  {
    code: "MISSING_TAX_SUBSTITUTE_REGISTRATION",
    title: "Cadastro de substituto tributário ausente",
    description: "Fornecedor ou operação exige validação de substituto tributário, mas não há cadastro correspondente.",
    severity: "ERROR",
    documentsCount: 117,
    occurrences: 248,
  },
  {
    code: "TAX_SUBSTITUTE_OUT_OF_VALIDITY",
    title: "Substituto tributário fora da vigência",
    description: "Cadastro fiscal do substituto tributário estava fora do período de validade da operação.",
    severity: "ERROR",
    documentsCount: 76,
    occurrences: 139,
  },
  {
    code: "TAX_SUBSTITUTE_ANNEX_MISMATCH",
    title: "Anexo do substituto tributário divergente",
    description: "O anexo fiscal vinculado ao substituto tributário não corresponde aos itens auditados.",
    severity: "WARNING",
    documentsCount: 92,
    occurrences: 205,
  },
  {
    code: "INPUT_OUTPUT_NCM_MISMATCH",
    title: "NCM divergente entre entrada e saída",
    description: "Mercadorias compradas e vendidas com descrição equivalente foram encontradas com NCM distinto.",
    severity: "WARNING",
    documentsCount: 402,
    occurrences: 1244,
  },
  {
    code: "INPUT_OUTPUT_CEST_MISMATCH",
    title: "CEST divergente entre entrada e saída",
    description: "CEST informado na saída diverge do CEST de entrada para produtos fiscalmente equivalentes.",
    severity: "WARNING",
    documentsCount: 358,
    occurrences: 1042,
  },
  {
    code: "INPUT_OUTPUT_ICMS_CODE_MISMATCH",
    title: "CST/CSOSN divergente entre entrada e saída",
    description: "Códigos de ICMS indicam mudança de tratamento fiscal sem regra de transição identificada.",
    severity: "ERROR",
    documentsCount: 394,
    occurrences: 1320,
  },
  {
    code: "INPUT_OUTPUT_CFOP_MISMATCH",
    title: "CFOP divergente entre entrada e saída",
    description: "CFOPs de entrada e saída indicam operações incompatíveis para o mesmo fluxo de mercadoria.",
    severity: "WARNING",
    documentsCount: 319,
    occurrences: 870,
  },
  {
    code: "INPUT_OUTPUT_RATE_MISMATCH",
    title: "Alíquota divergente entre entrada e saída",
    description: "Alíquota efetiva de saída não guarda coerência com a tributação identificada na entrada.",
    severity: "ERROR",
    documentsCount: 361,
    occurrences: 1118,
  },
  {
    code: "INPUT_OUTPUT_ST_MISMATCH",
    title: "ST divergente entre entrada e saída",
    description: "Tratamento de substituição tributária difere entre entrada e saída para itens relacionados.",
    severity: "CRITICAL",
    documentsCount: 476,
    occurrences: 1496,
  },
  {
    code: "OWN_OPERATION_BASE_MISMATCH",
    title: "Base de operação própria divergente",
    description: "Base de cálculo da operação própria não confere com valores fiscais e comerciais do documento.",
    severity: "WARNING",
    documentsCount: 214,
    occurrences: 589,
  },
  {
    code: "CREDIT_VALUE_MISMATCH",
    title: "Valor de crédito divergente",
    description: "Crédito fiscal apropriado diverge do valor calculado com base nas regras e documentos de entrada.",
    severity: "ERROR",
    documentsCount: 238,
    occurrences: 633,
  },
  {
    code: "DEBIT_VALUE_MISMATCH",
    title: "Valor de débito divergente",
    description: "Débito fiscal declarado diverge do valor esperado a partir dos XMLs de saída.",
    severity: "ERROR",
    documentsCount: 229,
    occurrences: 602,
  },
  {
    code: "ITEM_TOTAL_MISMATCH",
    title: "Total do item divergente",
    description: "Total do item não fecha com quantidade, valor unitário e composição tributária esperada.",
    severity: "WARNING",
    documentsCount: 171,
    occurrences: 399,
  },
];

export const DEMO_BATCH_DIVERGENCES: BatchAnalysisDivergence[] = DIVERGENCE_DEFINITIONS.map((item) => ({
  code: item.code,
  title: item.title,
  description: item.description,
  severity: item.severity,
  documentsCount: item.documentsCount,
  occurrences: item.occurrences,
  count: item.occurrences,
}));

export const DEMO_BATCH_DOCUMENTS_WITH_DIVERGENCES: BatchAnalysisDocument[] = [
  ["NFe_35250100428508000195650010000018411000018418.xml", 36, 142],
  ["NFe_35250100428508000195650010000018421000018429.xml", 34, 138],
  ["NFe_35250100428508000195650010000018431000018430.xml", 32, 121],
  ["NFe_35250100428508000195650010000018441000018441.xml", 31, 116],
  ["NFe_35250100428508000195650010000018451000018452.xml", 30, 109],
  ["NFe_35250100428508000195650010000018461000018463.xml", 29, 104],
  ["NFe_35250100428508000195650010000018471000018474.xml", 28, 99],
  ["NFe_35250100428508000195650010000018481000018485.xml", 27, 94],
  ["NFe_35250100428508000195650010000018491000018496.xml", 26, 88],
  ["NFe_35250100428508000195650010000018501000018502.xml", 25, 83],
  ["NFe_35250100428508000195650010000018511000018513.xml", 24, 79],
  ["NFe_35250100428508000195650010000018521000018524.xml", 23, 74],
].map(([originalName, divergencesCount, items], index) => ({
  id: `demo-file-div-${index + 1}`,
  fileId: `demo-file-div-${index + 1}`,
  originalName: String(originalName),
  divergencesCount: Number(divergencesCount),
  items: Number(items),
}));

export const DEMO_BATCH_DOCUMENTS_WITH_ERRORS: BatchAnalysisDocument[] = [
  {
    id: "demo-file-error-1",
    fileId: "demo-file-error-1",
    originalName: "NFe_35250100428508000195650010000019981000019984.xml",
    divergencesCount: 0,
    items: 0,
    error: "XML com assinatura digital inválida após normalização do documento.",
  },
  {
    id: "demo-file-error-2",
    fileId: "demo-file-error-2",
    originalName: "NFe_35250100428508000195650010000019991000019995.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento sem protocolo de autorização válido para cruzamento fiscal.",
  },
];

export const DEMO_BATCH_FISCAL_NOTES: BatchAnalysisFiscalNote[] = [
  {
    note: "Foram identificadas divergências recorrentes de ST entre XMLs de entrada e saída em produtos de limpeza, higiene e mercearia seca.",
    documentsCount: 596,
    occurrences: 1842,
  },
  {
    note: "A maior concentração de inconsistências ocorre em mercadorias com NCM 3402, 3808, 2202, 1905 e 2106.",
    documentsCount: 418,
    occurrences: 1267,
  },
  {
    note: "Há indícios de aplicação parcial de redução de base em operações de saída sem correspondência nas regras vigentes do período.",
    documentsCount: 219,
    occurrences: 705,
  },
  {
    note: "O cruzamento aponta fornecedores com cadastro de substituto tributário ausente ou fora de vigência em operações críticas.",
    documentsCount: 143,
    occurrences: 387,
  },
  {
    note: "A auditoria simulada considerou janeiro de 2025 e consolidou entradas e saídas com alto volume de itens repetidos.",
    documentsCount: 600,
    occurrences: 600,
  },
  {
    note: "Recomenda-se revisar parametrização fiscal por NCM/CEST/CFOP antes de qualquer retificação de documentos.",
    documentsCount: 596,
    occurrences: 1,
  },
];

export const DEMO_BATCH_ANALYSIS: BatchAnalysisResponse = {
  batch: DEMO_BATCH_SUMMARY,
  period: {
    startIssuedAt: "2025-01-01T00:00:00.000Z",
    endIssuedAt: "2025-01-31T23:59:59.000Z",
  },
  summary: {
    totalDocuments: 600,
    totalProcessed: 598,
    totalWithDivergences: 596,
    totalWithErrors: 2,
    totalDivergences: 20,
  },
  divergences: DEMO_BATCH_DIVERGENCES,
  fiscalNotes: DEMO_BATCH_FISCAL_NOTES,
  documents: {
    withDivergences: DEMO_BATCH_DOCUMENTS_WITH_DIVERGENCES,
    withErrors: DEMO_BATCH_DOCUMENTS_WITH_ERRORS,
  },
};

const DEMO_FILE_UPLOADER = {
  id: "demo-user-auditoria",
  name: "Admin",
  email: "admin@ccf.demo",
};

export const DEMO_BATCH_FILES: FileRecord[] = [
  ...DEMO_BATCH_DOCUMENTS_WITH_DIVERGENCES,
  ...DEMO_BATCH_DOCUMENTS_WITH_ERRORS,
].map((document, index) => ({
  id: document.fileId ?? `demo-file-${index + 1}`,
  originalName: document.originalName ?? `NFe_${index + 1}.xml`,
  mimeType: "application/xml",
  size: 186000 + index * 7340,
  status: document.error ? "ERROR" : "PROCESSED",
  createdAt: `2025-01-${String((index % 28) + 1).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:35:00.000Z`,
  updatedAt: DEMO_UPDATED_AT,
  uploadedBy: DEMO_FILE_UPLOADER,
}));

export const DEMO_BATCH_FINANCIALS = {
  metrics: [
    {
      label: "Valor total de entradas",
      value: 4835420.35,
      helper: "XMLs de compra normalizados no período",
      tone: "neutral",
    },
    {
      label: "Valor total de saídas",
      value: 5318790.72,
      helper: "XMLs de venda cruzados com as entradas",
      tone: "neutral",
    },
    {
      label: "Base de cálculo analisada",
      value: 4982110.44,
      helper: "Base consolidada após deduções simuladas",
      tone: "indigo",
    },
    {
      label: "ICMS próprio",
      value: 612348.18,
      helper: "Valor estimado nas operações próprias",
      tone: "neutral",
    },
    {
      label: "ICMS ST",
      value: 388902.55,
      helper: "Substituição tributária recalculada",
      tone: "amber",
    },
    {
      label: "Crédito a restituir",
      value: 421390.72,
      helper: "Crédito potencial identificado nas entradas",
      tone: "emerald",
    },
    {
      label: "Débito a complementar",
      value: 683941.11,
      helper: "Débito estimado sobre as saídas",
      tone: "rose",
    },
    {
      label: "Impacto fiscal estimado",
      value: 262550.39,
      helper: "Diferença projetada para revisão fiscal",
      tone: "rose",
    },
  ],
  valueDivergences: [
    {
      code: "ICMS_ST_VALUE_MISMATCH",
      title: "Valor de ICMS-ST divergente",
      estimatedImpact: 78640.55,
      documentsCount: 247,
      occurrences: 782,
      severity: "ERROR",
    },
    {
      code: "INPUT_OUTPUT_TAX_TREATMENT_MISMATCH",
      title: "Tratamento fiscal incompatível",
      estimatedImpact: 64280.31,
      documentsCount: 596,
      occurrences: 1842,
      severity: "CRITICAL",
    },
    {
      code: "MISSING_ST_TREATMENT",
      title: "Tratamento de ST ausente",
      estimatedImpact: 51120.9,
      documentsCount: 489,
      occurrences: 1511,
      severity: "CRITICAL",
    },
    {
      code: "CREDIT_VALUE_MISMATCH",
      title: "Valor de crédito divergente",
      estimatedImpact: 34680.44,
      documentsCount: 238,
      occurrences: 633,
      severity: "ERROR",
    },
    {
      code: "INTERNAL_RATE_MISMATCH",
      title: "Alíquota interna divergente",
      estimatedImpact: 21435.18,
      documentsCount: 337,
      occurrences: 963,
      severity: "ERROR",
    },
  ],
  topDocuments: [
    {
      fileName: "NFe_35250100428508000195650010000018411000018418.xml",
      operation: "Saída",
      difference: 18420.91,
      reason: "ICMS-ST recolhido abaixo do esperado para produtos com CEST obrigatório.",
      status: "Crítico",
    },
    {
      fileName: "NFe_35250100428508000195650010000018421000018429.xml",
      operation: "Entrada",
      difference: 15760.48,
      reason: "Crédito apropriado acima do valor calculado pela regra fiscal simulada.",
      status: "Atenção",
    },
    {
      fileName: "NFe_35250100428508000195650010000018441000018441.xml",
      operation: "Saída",
      difference: 13980.12,
      reason: "Alíquota efetiva incompatível com NCM, UF e natureza da operação.",
      status: "Crítico",
    },
    {
      fileName: "NFe_35250100428508000195650010000018461000018463.xml",
      operation: "Saída",
      difference: 11240.73,
      reason: "Base de cálculo reduzida sem regra fiscal correspondente no período.",
      status: "Atenção",
    },
    {
      fileName: "NFe_35250100428508000195650010000018501000018502.xml",
      operation: "Entrada",
      difference: 9860.65,
      reason: "Divergência entre tratamento fiscal de compra e venda do mesmo item.",
      status: "Atenção",
    },
  ],
} as const;

export type DemoDemonstrativeRow = {
  document: string;
  product: string;
  ncm: string;
  cest: string;
  cfop: string;
  cst: string;
  internalRate: number;
  mva: number;
  baseReduction: number;
  ownOperationBase: number;
  credit: number;
  stBase: number;
  debit: number;
  declaredSt: number;
  calculatedSt: number;
  divergence: number;
  fiscalInfo: string;
};

const FISCAL_DEMO_DIVERGENCES: BatchAnalysisDivergence[] = [
  {
    code: "ICMS_ST_VALUE_MISMATCH",
    title: "Valor de ICMS ST divergente",
    description:
      "CST/CFOP com ICMS ST declarado inferior ao valor apurado pelo demonstrativo fiscal.",
    severity: "CRITICAL",
    documentsCount: 8200,
    occurrences: 234588,
    count: 234588,
  },
  {
    code: "DEBIT_VALUE_MISMATCH",
    title: "Valor de débito divergente",
    description:
      "Débito da operação ST apurado pelo fisco supera o valor declarado no período monitorado.",
    severity: "ERROR",
    documentsCount: 6100,
    occurrences: 114379,
    count: 114379,
  },
  {
    code: "MISSING_ST_TREATMENT",
    title: "Tratamento de ST não aplicado",
    description:
      "Itens do Anexo IV foram movimentados sem destaque compatível de substituição tributária.",
    severity: "ERROR",
    documentsCount: 2400,
    occurrences: 26676,
    count: 26676,
  },
  {
    code: "CFOP_ST_MISMATCH",
    title: "CFOP incompatível com substituição tributária",
    description:
      "CFOPs de transferência foram usados em itens com apuração de ICMS ST exigida pelo demonstrativo.",
    severity: "WARNING",
    documentsCount: 980,
    occurrences: 4492,
    count: 4492,
  },
  {
    code: "MVA_MISMATCH",
    title: "MVA divergente",
    description:
      "Margens de valor agregado consideradas pelo contribuinte divergem dos parâmetros fiscais por NST/NCM.",
    severity: "WARNING",
    documentsCount: 520,
    occurrences: 2000,
    count: 2000,
  },
  {
    code: "BASE_REDUCTION_RATE_MISMATCH",
    title: "Percentual de redução de base divergente",
    description:
      "Reduções de base aplicadas não correspondem aos percentuais previstos para crédito e débito fiscal.",
    severity: "WARNING",
    documentsCount: 740,
    occurrences: 3520,
    count: 3520,
  },
];

const FISCAL_DEMO_DOCUMENTS_WITH_DIVERGENCES: BatchAnalysisDocument[] = [
  ["NFe_53200347508411152177551000033996211197995700.xml", 6, 42],
  ["NFe_53200347508411152177551000033996381197995928.xml", 5, 38],
  ["NFe_53200347508411152177551000033996971197993853.xml", 6, 51],
  ["NFe_53200547508411152177551100000029501106191923.xml", 4, 27],
  ["NFe_53200547508411152177551100000029631106193282.xml", 4, 25],
  ["NFe_53200547508411152177551100000031341106207215.xml", 5, 48],
  ["NFe_53200547508411152177551100000050641106414302.xml", 5, 37],
  ["NFe_53210147508411152177551000034011221198200115.xml", 7, 64],
  ["NFe_53210147508411152177551000034011891198200742.xml", 6, 59],
  ["NFe_53210247508411152177551000034022861198410088.xml", 5, 33],
].map(([originalName, divergencesCount, items], index) => ({
  id: `fiscal-demo-file-div-${index + 1}`,
  fileId: `fiscal-demo-file-div-${index + 1}`,
  originalName: String(originalName),
  divergencesCount: Number(divergencesCount),
  items: Number(items),
}));

const FISCAL_DEMO_DOCUMENTS_WITH_ERRORS: BatchAnalysisDocument[] = [
  {
    id: "fiscal-demo-file-error-1",
    fileId: "fiscal-demo-file-error-1",
    originalName: "NFe_53210247508411152177551000034029991198488120.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento sem correspondência de produto revisado no demonstrativo fiscal.",
  },
];

const FISCAL_DEMO_FISCAL_NOTES: BatchAnalysisFiscalNote[] = [
  {
    note: "Consolidação do demonstrativo fiscal de monitoramento ST, com comparação entre valores declarados e apurados.",
    documentsCount: 18240,
    occurrences: 1,
  },
  {
    note: "CST 60 com CFOP 5409 concentra a maior divergência: declarado igual a zero e apurado superior a R$ 4 milhões.",
    documentsCount: 8200,
    occurrences: 234588,
  },
  {
    note: "Período de apuração simulado: março de 2020 a janeiro de 2022, conforme lógica de vigência do ato declaratório.",
    documentsCount: 18240,
    occurrences: 1,
  },
  {
    note: "Informações ao fisco destacam divergência de alíquota interna, MVA, redução de base e tratamento de ICMS ST por produto.",
    documentsCount: 6100,
    occurrences: 114379,
  },
];

export const FISCAL_DEMO_BATCH_ANALYSIS: BatchAnalysisResponse = {
  batch: FISCAL_DEMO_BATCH_SUMMARY,
  period: {
    startIssuedAt: "2020-03-01T00:00:00.000Z",
    endIssuedAt: "2022-01-31T23:59:59.000Z",
  },
  summary: {
    totalDocuments: 18240,
    totalProcessed: 18237,
    totalWithDivergences: 16890,
    totalWithErrors: 1,
    totalDivergences: FISCAL_DEMO_DIVERGENCES.length,
  },
  divergences: FISCAL_DEMO_DIVERGENCES,
  fiscalNotes: FISCAL_DEMO_FISCAL_NOTES,
  documents: {
    withDivergences: FISCAL_DEMO_DOCUMENTS_WITH_DIVERGENCES,
    withErrors: FISCAL_DEMO_DOCUMENTS_WITH_ERRORS,
  },
};

export const FISCAL_DEMO_FINANCIALS = {
  metrics: [
    {
      label: "Base operação própria",
      value: 112546623.02,
      helper: "Base consolidada das operações analisadas",
      tone: "indigo",
    },
    {
      label: "Crédito a restituir",
      value: 608841.71,
      helper: "Valor declarado/consolidado como crédito fiscal",
      tone: "emerald",
    },
    {
      label: "Base operação ST",
      value: 31847596.72,
      helper: "Base recalculada para substituição tributária",
      tone: "amber",
    },
    {
      label: "Débito a complementar",
      value: 6381906.33,
      helper: "Valor apurado pelo demonstrativo fiscal",
      tone: "rose",
    },
    {
      label: "ICMS ST declarado",
      value: 608841.71,
      helper: "Total declarado pelo contribuinte",
      tone: "neutral",
    },
    {
      label: "ICMS ST apurado",
      value: 6381906.33,
      helper: "Total apurado pela lógica fiscal",
      tone: "rose",
    },
    {
      label: "Diferença total apurada",
      value: 5773064.63,
      helper: "Apurado menos declarado",
      tone: "rose",
    },
    {
      label: "Impacto fiscal estimado",
      value: 5773064.63,
      helper: "Diferença consolidada para revisão fiscal",
      tone: "rose",
    },
  ],
  valueDivergences: [
    {
      code: "ICMS_ST_VALUE_MISMATCH",
      title: "ICMS ST declarado x apurado",
      estimatedImpact: 4076970.7,
      documentsCount: 8200,
      occurrences: 234588,
      severity: "CRITICAL",
    },
    {
      code: "DEBIT_VALUE_MISMATCH",
      title: "Débito de ST apurado sem declaração compatível",
      estimatedImpact: 1384433.54,
      documentsCount: 6100,
      occurrences: 114379,
      severity: "ERROR",
    },
    {
      code: "MISSING_ST_TREATMENT",
      title: "ST ausente em itens do Anexo IV",
      estimatedImpact: 178805.51,
      documentsCount: 2400,
      occurrences: 26676,
      severity: "ERROR",
    },
    {
      code: "BASE_REDUCTION_RATE_MISMATCH",
      title: "Base reduzida divergente",
      estimatedImpact: 68207.83,
      documentsCount: 740,
      occurrences: 3520,
      severity: "WARNING",
    },
    {
      code: "MVA_MISMATCH",
      title: "MVA e alíquota fiscal divergentes",
      estimatedImpact: 25157.56,
      documentsCount: 520,
      occurrences: 2000,
      severity: "WARNING",
    },
  ],
  topDocuments: [
    {
      fileName: "NFe_53200347508411152177551000033996211197995700.xml",
      operation: "Saída",
      difference: 98642.18,
      reason: "Produto de limpeza com ICMS ST apurado acima do declarado.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53200547508411152177551100000029501106191923.xml",
      operation: "Saída",
      difference: 74408.32,
      reason: "Bebida quente com MVA e base ST recalculadas.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53200347508411152177551000033996381197995928.xml",
      operation: "Saída",
      difference: 53318.44,
      reason: "CST 60 sem débito declarado compatível com demonstrativo.",
      status: "Atenção",
    },
    {
      fileName: "NFe_53200547508411152177551100000050641106414302.xml",
      operation: "Saída",
      difference: 48891.2,
      reason: "Alíquota interna e MVA divergentes em item do Anexo IV.",
      status: "Atenção",
    },
  ],
} as const;

export const FISCAL_DEMO_DEMONSTRATIVE_ROWS: DemoDemonstrativeRow[] = [
  {
    document: "3399621",
    product: "DET PO BRIL LIMP TT BAG LV1.6PG1.4K",
    ncm: "38089419",
    cest: "0",
    cfop: "5409",
    cst: "60",
    internalRate: 29,
    mva: 29.04,
    baseReduction: 0,
    ownOperationBase: 65630,
    credit: 0,
    stBase: 84686.95,
    debit: 24559.22,
    declaredSt: 0,
    calculatedSt: 24559.22,
    divergence: 24559.22,
    fiscalInfo: "Item 39 do Anexo IV; ST apurada pelo fisco sem valor declarado correspondente.",
  },
  {
    document: "3399638",
    product: "SABAO PASTA COCO UFE 500G",
    ncm: "34011900",
    cest: "0",
    cfop: "5409",
    cst: "60",
    internalRate: 29,
    mva: 29.04,
    baseReduction: 0,
    ownOperationBase: 63240,
    credit: 0,
    stBase: 81599.3,
    debit: 23663.8,
    declaredSt: 0,
    calculatedSt: 23663.8,
    divergence: 23663.8,
    fiscalInfo: "CST indica cobrança anterior, mas demonstrativo apura débito ST na saída.",
  },
  {
    document: "3399697",
    product: "LIMP VIM CLORO GEL 700ML ORIGINAL",
    ncm: "38089419",
    cest: "0",
    cfop: "5409",
    cst: "60",
    internalRate: 29,
    mva: 29.04,
    baseReduction: 0,
    ownOperationBase: 54010,
    credit: 0,
    stBase: 69703.3,
    debit: 20213.96,
    declaredSt: 0,
    calculatedSt: 20213.96,
    divergence: 20213.96,
    fiscalInfo: "Produto classificado em segmento sujeito a ST conforme parâmetro NST do demonstrativo.",
  },
  {
    document: "2950",
    product: "PP VH PORT BCO DON JOAO I 750ML",
    ncm: "22042100",
    cest: "202400",
    cfop: "5152",
    cst: "00",
    internalRate: 29,
    mva: 29.04,
    baseReduction: 0,
    ownOperationBase: 91990,
    credit: 2667.71,
    stBase: 118705.9,
    debit: 34424.71,
    declaredSt: 9210.5,
    calculatedSt: 31757,
    divergence: 22546.5,
    fiscalInfo: "Bebida quente; diferença entre ICMS ST declarado e apurado após MVA.",
  },
  {
    document: "2963",
    product: "PP VH PORT BCO DON JOAO I 750ML",
    ncm: "22042100",
    cest: "202400",
    cfop: "5152",
    cst: "10",
    internalRate: 29,
    mva: 29.04,
    baseReduction: 0,
    ownOperationBase: 91990,
    credit: 2667.71,
    stBase: 118705.9,
    debit: 34424.71,
    declaredSt: 10152.42,
    calculatedSt: 31757,
    divergence: 21604.58,
    fiscalInfo: "Alíquota integral desmembrada entre ICMS ST e FCP ST conforme nota explicativa.",
  },
  {
    document: "5064",
    product: "WHIS ESC JW WHITE WALKER 750ML",
    ncm: "22089000",
    cest: "201600",
    cfop: "5409",
    cst: "70",
    internalRate: 29,
    mva: 29.04,
    baseReduction: 12,
    ownOperationBase: 1531910,
    credit: 35233.93,
    stBase: 1738942.77,
    debit: 504293.4,
    declaredSt: 398612.1,
    calculatedSt: 469059.47,
    divergence: 70447.37,
    fiscalInfo: "Redução de base e MVA revisadas no demonstrativo de cálculo.",
  },
];

export const FISCAL_DEMO_BATCH_FILES: FileRecord[] = [
  ...FISCAL_DEMO_DOCUMENTS_WITH_DIVERGENCES,
  ...FISCAL_DEMO_DOCUMENTS_WITH_ERRORS,
].map((document, index) => ({
  id: document.fileId ?? `fiscal-demo-file-${index + 1}`,
  originalName: document.originalName ?? `NFe_monitoramento_st_${index + 1}.xml`,
  mimeType: "application/xml",
  size: 248000 + index * 9820,
  status: document.error ? "ERROR" : "PROCESSED",
  createdAt: `2022-01-${String((index % 28) + 1).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:20:00.000Z`,
  updatedAt: FISCAL_DEMO_UPDATED_AT,
  uploadedBy: DEMO_FILE_UPLOADER,
}));

const CONSTRUCTION_DEMO_DIVERGENCES: BatchAnalysisDivergence[] = [
  {
    code: "ICMS_ST_VALUE_MISMATCH",
    title: "Valor de ICMS ST divergente",
    description:
      "Valor de ICMS ST apurado supera o total declarado em operações com mercadorias de construção sujeitas ao regime.",
    severity: "CRITICAL",
    documentsCount: 4800,
    occurrences: 45885,
    count: 45885,
  },
  {
    code: "DEBIT_VALUE_MISMATCH",
    title: "Valor de débito divergente",
    description:
      "Débito da operação ST apurado apresenta diferença relevante em relação ao débito declarado nas saídas.",
    severity: "CRITICAL",
    documentsCount: 8200,
    occurrences: 470687,
    count: 470687,
  },
  {
    code: "OWN_OPERATION_BASE_MISMATCH",
    title: "Base da operação própria divergente",
    description:
      "Base declarada da operação própria diverge da base apurada após revisão de frete, desconto e despesas acessórias.",
    severity: "ERROR",
    documentsCount: 6900,
    occurrences: 470687,
    count: 470687,
  },
  {
    code: "BASE_REDUCTION_RATE_MISMATCH",
    title: "Percentual de redução de base divergente",
    description:
      "Percentuais de redução aplicados em itens de construção não correspondem aos parâmetros fiscais considerados.",
    severity: "ERROR",
    documentsCount: 7200,
    occurrences: 45885,
    count: 45885,
  },
  {
    code: "CREDIT_VALUE_MISMATCH",
    title: "Valor de crédito divergente",
    description:
      "Crédito da operação própria foi declarado acima do valor apurado para itens com alíquota e base revisadas.",
    severity: "WARNING",
    documentsCount: 5400,
    occurrences: 27475,
    count: 27475,
  },
  {
    code: "MISSING_CREDIT_REVERSAL",
    title: "Estorno de crédito não aplicado",
    description:
      "Devoluções e retornos de mercadorias não apresentam estorno de crédito compatível com a operação de referência.",
    severity: "WARNING",
    documentsCount: 1800,
    occurrences: 2679,
    count: 2679,
  },
  {
    code: "TAX_SUBSTITUTE_OUT_OF_VALIDITY",
    title: "Substituto tributário fora da vigência",
    description:
      "Foram identificadas operações com enquadramento de substituto tributário sem vigência compatível no período.",
    severity: "ERROR",
    documentsCount: 960,
    occurrences: 1730,
    count: 1730,
  },
  {
    code: "TAX_SUBSTITUTE_ANNEX_MISMATCH",
    title: "Substituto tributário incompatível com o anexo",
    description:
      "Produtos vinculados a ferragens, ferramentas e materiais elétricos foram associados a anexo fiscal incompatível.",
    severity: "WARNING",
    documentsCount: 1340,
    occurrences: 21330,
    count: 21330,
  },
  {
    code: "INTERNAL_RATE_MISMATCH",
    title: "Alíquota interna divergente",
    description:
      "Alíquotas internas consideradas pelo contribuinte divergem das alíquotas aplicáveis aos itens revisados.",
    severity: "WARNING",
    documentsCount: 2100,
    occurrences: 3490,
    count: 3490,
  },
  {
    code: "MISSING_ST_TREATMENT",
    title: "Tratamento de ST não aplicado",
    description:
      "Itens sujeitos à substituição tributária foram emitidos com tratamento de tributação própria sem complemento.",
    severity: "ERROR",
    documentsCount: 3650,
    occurrences: 45885,
    count: 45885,
  },
];

const CONSTRUCTION_DEMO_DOCUMENTS_WITH_DIVERGENCES: BatchAnalysisDocument[] = [
  ["NFe_53170311223344000155550010005815991006145355.xml", 7, 36],
  ["NFe_53170311223344000155550010005816151006145547.xml", 8, 58],
  ["NFe_53200411223344000155550010012051771047774724.xml", 9, 64],
  ["NFe_53200611223344000155550010012688411051593018.xml", 6, 41],
  ["NFe_53200811223344000155550010013349091055210422.xml", 7, 49],
  ["NFe_53201111223344000155550010014177271059432203.xml", 5, 32],
  ["NFe_53210311223344000155550010015100481068140352.xml", 8, 72],
  ["NFe_53210611223344000155550010015988221074421916.xml", 6, 44],
  ["NFe_53211011223344000155550010016850101081240891.xml", 7, 57],
  ["NFe_53220111223344000155550010017400931085002177.xml", 6, 39],
].map(([originalName, divergencesCount, items], index) => ({
  id: `construction-demo-file-div-${index + 1}`,
  fileId: `construction-demo-file-div-${index + 1}`,
  originalName: String(originalName),
  divergencesCount: Number(divergencesCount),
  items: Number(items),
}));

const CONSTRUCTION_DEMO_DOCUMENTS_WITH_ERRORS: BatchAnalysisDocument[] = [
  {
    id: "construction-demo-file-error-1",
    fileId: "construction-demo-file-error-1",
    originalName: "NFe_53210711223344000155550010016099311075400823.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com item sem vínculo válido ao parâmetro fiscal de material de construção.",
  },
  {
    id: "construction-demo-file-error-2",
    fileId: "construction-demo-file-error-2",
    originalName: "NFe_53210911223344000155550010016670721079381266.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com inconsistência cadastral no destinatário da operação.",
  },
  {
    id: "construction-demo-file-error-3",
    fileId: "construction-demo-file-error-3",
    originalName: "NFe_53211211223344000155550010017180151083054011.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com referência fiscal incompleta para devolução parcial.",
  },
];

const CONSTRUCTION_DEMO_FISCAL_NOTES: BatchAnalysisFiscalNote[] = [
  {
    note: "A maior concentração de divergências está em mercadorias de construção, ferragens e materiais elétricos com tratamento de ST.",
    documentsCount: 8200,
    occurrences: 470687,
  },
  {
    note: "Operações com CST 0 e CFOP 5102 concentram diferenças de base própria e débito complementar.",
    documentsCount: 6900,
    occurrences: 470687,
  },
  {
    note: "Itens com CST 10 e CFOP 5403 indicam complemento relevante de ICMS ST por diferença entre declarado e apurado.",
    documentsCount: 4800,
    occurrences: 45885,
  },
  {
    note: "Devoluções com CFOP 1202 e 1411 exigem revisão de estorno de crédito e recomposição da operação de referência.",
    documentsCount: 1800,
    occurrences: 2679,
  },
];

export const CONSTRUCTION_DEMO_BATCH_ANALYSIS: BatchAnalysisResponse = {
  batch: CONSTRUCTION_DEMO_BATCH_SUMMARY,
  period: {
    startIssuedAt: "2017-03-01T00:00:00.000Z",
    endIssuedAt: "2022-01-31T23:59:59.000Z",
  },
  summary: {
    totalDocuments: 27480,
    totalProcessed: 27474,
    totalWithDivergences: 21960,
    totalWithErrors: 3,
    totalDivergences: CONSTRUCTION_DEMO_DIVERGENCES.length,
  },
  divergences: CONSTRUCTION_DEMO_DIVERGENCES,
  fiscalNotes: CONSTRUCTION_DEMO_FISCAL_NOTES,
  documents: {
    withDivergences: CONSTRUCTION_DEMO_DOCUMENTS_WITH_DIVERGENCES,
    withErrors: CONSTRUCTION_DEMO_DOCUMENTS_WITH_ERRORS,
  },
};

export const CONSTRUCTION_DEMO_FINANCIALS = {
  metrics: [
    {
      label: "Base operação própria",
      value: 186793869.6,
      helper: "Base declarada nas operações próprias",
      tone: "indigo",
    },
    {
      label: "Crédito a restituir",
      value: 759390.09,
      helper: "Diferença entre crédito declarado e apurado",
      tone: "emerald",
    },
    {
      label: "Base operação ST",
      value: 239860927.76,
      helper: "Base apurada para operação com substituição tributária",
      tone: "amber",
    },
    {
      label: "Débito a complementar",
      value: 33946434.04,
      helper: "Diferença entre débito declarado e apurado",
      tone: "rose",
    },
    {
      label: "ICMS ST declarado",
      value: 1846556.37,
      helper: "Total declarado pelo contribuinte",
      tone: "neutral",
    },
    {
      label: "ICMS ST apurado",
      value: 9908037.94,
      helper: "Total apurado pela revisão fiscal",
      tone: "rose",
    },
    {
      label: "Diferença total apurada",
      value: 6935818.89,
      helper: "Resultado consolidado após devoluções e ajustes",
      tone: "rose",
    },
    {
      label: "Impacto fiscal estimado",
      value: 6935818.89,
      helper: "Diferença consolidada para revisão fiscal",
      tone: "rose",
    },
  ],
  valueDivergences: [
    {
      code: "ICMS_ST_VALUE_MISMATCH",
      title: "ICMS ST declarado x apurado",
      estimatedImpact: 6935818.89,
      documentsCount: 4800,
      occurrences: 45885,
      severity: "CRITICAL",
    },
    {
      code: "DEBIT_VALUE_MISMATCH",
      title: "Débito complementar em materiais de construção",
      estimatedImpact: 4167220.34,
      documentsCount: 8200,
      occurrences: 470687,
      severity: "CRITICAL",
    },
    {
      code: "OWN_OPERATION_BASE_MISMATCH",
      title: "Base própria recalculada",
      estimatedImpact: 2764393.37,
      documentsCount: 6900,
      occurrences: 470687,
      severity: "ERROR",
    },
    {
      code: "BASE_REDUCTION_RATE_MISMATCH",
      title: "Redução de base aplicada com percentual divergente",
      estimatedImpact: 2184220.4,
      documentsCount: 7200,
      occurrences: 45885,
      severity: "ERROR",
    },
    {
      code: "CREDIT_VALUE_MISMATCH",
      title: "Crédito de operação própria divergente",
      estimatedImpact: 759390.09,
      documentsCount: 5400,
      occurrences: 27475,
      severity: "WARNING",
    },
    {
      code: "TAX_SUBSTITUTE_ANNEX_MISMATCH",
      title: "Enquadramento incompatível com o anexo",
      estimatedImpact: 612514.82,
      documentsCount: 1340,
      occurrences: 21330,
      severity: "WARNING",
    },
  ],
  topDocuments: [
    {
      fileName: "NFe_53170311223344000155550010005816151006145547.xml",
      operation: "Saída",
      difference: 112480.54,
      reason: "Argamassas e espaçadores com base ST apurada acima da base declarada.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53200411223344000155550010012051771047774724.xml",
      operation: "Saída",
      difference: 96420.18,
      reason: "Materiais elétricos com anexo fiscal e redução de base divergentes.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53170311223344000155550010005815991006145355.xml",
      operation: "Entrada",
      difference: 64418.73,
      reason: "Devolução parcial sem recomposição completa do crédito fiscal.",
      status: "Atenção",
    },
    {
      fileName: "NFe_53201111223344000155550010014177271059432203.xml",
      operation: "Saída",
      difference: 52390.12,
      reason: "Ferragens com substituto tributário fora da vigência indicada.",
      status: "Atenção",
    },
  ],
} as const;

export const CONSTRUCTION_DEMO_DEMONSTRATIVE_ROWS: DemoDemonstrativeRow[] = [
  {
    document: "581599",
    product: "TE CEMAR HORIZ. LISO 100X100 90 GF",
    ncm: "73089010",
    cest: "1006500",
    cfop: "1202",
    cst: "00",
    internalRate: 12,
    mva: 31.33,
    baseReduction: 0,
    ownOperationBase: 17730,
    credit: 2130,
    stBase: 23280,
    debit: 2790,
    declaredSt: 0,
    calculatedSt: 660,
    divergence: -660,
    fiscalInfo: "Devolução parcial exige recomposição do crédito da operação de referência.",
  },
  {
    document: "581615",
    product: "ARGAMASSA VOTORANTIM ACIII CZ 20KG EXT",
    ncm: "32149000",
    cest: "1002800",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 29.72,
    baseReduction: 0,
    ownOperationBase: 672500,
    credit: 121050,
    stBase: 872370,
    debit: 157030,
    declaredSt: 0,
    calculatedSt: 35980,
    divergence: 35980,
    fiscalInfo: "Base de ST recalculada para item de argamassa sujeito ao regime.",
  },
  {
    document: "581615",
    product: "ESPACADOR CORTAG NIVELADOR 1,0MM",
    ncm: "39269090",
    cest: "1007800",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 28.92,
    baseReduction: 0,
    ownOperationBase: 16500,
    credit: 2970,
    stBase: 21270,
    debit: 3830,
    declaredSt: 0,
    calculatedSt: 860,
    divergence: 860,
    fiscalInfo: "Produto plástico para construção com débito complementar apurado.",
  },
  {
    document: "1205177",
    product: "CABINHO FLEX 2,5MM AMARELO INDUSC/SIL",
    ncm: "85444900",
    cest: "1200100",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 28.92,
    baseReduction: 0,
    ownOperationBase: 110660,
    credit: 19920,
    stBase: 142660,
    debit: 25680,
    declaredSt: 0,
    calculatedSt: 7550,
    divergence: 7550,
    fiscalInfo: "Material elétrico com CFOP de tributação própria e tratamento de ST apurado.",
  },
  {
    document: "1205177",
    product: "SOQUETE DECORLUX/LORENZE E27 MT2085",
    ncm: "85366100",
    cest: "1200500",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 30.52,
    baseReduction: 0,
    ownOperationBase: 1610,
    credit: 290,
    stBase: 2100,
    debit: 380,
    declaredSt: 0,
    calculatedSt: 120,
    divergence: 120,
    fiscalInfo: "Conector elétrico enquadrado em operação ST no período analisado.",
  },
  {
    document: "1205177",
    product: "TOMADA FAME EVD 2P+T 10A",
    ncm: "85366910",
    cest: "1200700",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 30.52,
    baseReduction: 41.67,
    ownOperationBase: 15660,
    credit: 2820,
    stBase: 11920,
    debit: 1430,
    declaredSt: 0,
    calculatedSt: 430,
    divergence: 430,
    fiscalInfo: "Redução de base aplicada com percentual divergente na operação ST.",
  },
  {
    document: "1334909",
    product: "ADAPT GAS BLUKIT BRUTO MACHO 1/2 X 3/8",
    ncm: "74122000",
    cest: "1006500",
    cfop: "5403",
    cst: "10",
    internalRate: 18,
    mva: 33.08,
    baseReduction: 0,
    ownOperationBase: 228450,
    credit: 41121,
    stBase: 304020,
    debit: 54724,
    declaredSt: 12480,
    calculatedSt: 13603,
    divergence: 1123,
    fiscalInfo: "Acessório de cobre vinculado ao anexo de construção com MVA revisada.",
  },
  {
    document: "1417727",
    product: "DISJUNTOR TRIPOLAR 63A CURVA C",
    ncm: "85362000",
    cest: "1200300",
    cfop: "5403",
    cst: "10",
    internalRate: 18,
    mva: 34.12,
    baseReduction: 0,
    ownOperationBase: 486900,
    credit: 87642,
    stBase: 653010,
    debit: 117542,
    declaredSt: 58320,
    calculatedSt: 29899,
    divergence: 29899,
    fiscalInfo: "Substituto tributário fora da vigência indicada para parte dos itens.",
  },
];

export const CONSTRUCTION_DEMO_BATCH_FILES: FileRecord[] = [
  ...CONSTRUCTION_DEMO_DOCUMENTS_WITH_DIVERGENCES,
  ...CONSTRUCTION_DEMO_DOCUMENTS_WITH_ERRORS,
].map((document, index) => ({
  id: document.fileId ?? `construction-demo-file-${index + 1}`,
  originalName: document.originalName ?? `NFe_construmax_${index + 1}.xml`,
  mimeType: "application/xml",
  size: 198000 + index * 12450,
  status: document.error ? "ERROR" : "PROCESSED",
  createdAt: `2022-01-${String((index % 28) + 1).padStart(2, "0")}T${String(8 + (index % 9)).padStart(2, "0")}:35:00.000Z`,
  updatedAt: CONSTRUCTION_DEMO_UPDATED_AT,
  uploadedBy: DEMO_FILE_UPLOADER,
}));

const ITATIAIA_DEMO_DIVERGENCES: BatchAnalysisDivergence[] = [
  {
    code: "MISSING_ST_TREATMENT",
    title: "Tratamento de ST não aplicado",
    description:
      "Itens de material elétrico e construção foram emitidos com tributação própria, apesar do enquadramento fiscal indicar substituição tributária.",
    severity: "CRITICAL",
    documentsCount: 6200,
    occurrences: 34053,
    count: 34053,
  },
  {
    code: "OWN_OPERATION_BASE_MISMATCH",
    title: "Base da operação própria divergente",
    description:
      "A base própria declarada diverge da base apurada após recomposição de descontos, frete e devoluções parciais.",
    severity: "ERROR",
    documentsCount: 5100,
    occurrences: 262509,
    count: 262509,
  },
  {
    code: "INTERNAL_RATE_MISMATCH",
    title: "Alíquota interna divergente",
    description:
      "Alíquotas internas declaradas em 12% foram revisadas para o parâmetro fiscal aplicável a itens elétricos e conexões.",
    severity: "ERROR",
    documentsCount: 4200,
    occurrences: 28121,
    count: 28121,
  },
  {
    code: "INVALID_CEST_NCM_COMBINATION",
    title: "Combinação inválida entre CEST e NCM",
    description:
      "Combinações de NCM e CEST não aderem aos parâmetros fiscais usados para tomadas, interruptores e tubos de construção.",
    severity: "WARNING",
    documentsCount: 3600,
    occurrences: 15258,
    count: 15258,
  },
  {
    code: "CFOP_ST_MISMATCH",
    title: "CFOP incompatível com substituição tributária",
    description:
      "Operações com indício de ST foram registradas com CFOP de tributação própria ou devolução sem recomposição fiscal.",
    severity: "ERROR",
    documentsCount: 3100,
    occurrences: 11943,
    count: 11943,
  },
  {
    code: "INPUT_OUTPUT_TAX_TREATMENT_MISMATCH",
    title: "Tratamento fiscal incompatível entre entrada e saída",
    description:
      "O tratamento fiscal aplicado nas saídas diverge do enquadramento das entradas correspondentes para itens do mesmo segmento.",
    severity: "WARNING",
    documentsCount: 2850,
    occurrences: 5168,
    count: 5168,
  },
  {
    code: "CREDIT_VALUE_MISMATCH",
    title: "Valor de crédito divergente",
    description:
      "Crédito da operação própria apresenta diferença após revisão de alíquota e base em operações com devolução.",
    severity: "WARNING",
    documentsCount: 1700,
    occurrences: 1211,
    count: 1211,
  },
  {
    code: "MISSING_BASE_REDUCTION",
    title: "Redução de base não aplicada",
    description:
      "Itens com parâmetro de redução de base não apresentam aplicação compatível na operação ST apurada.",
    severity: "WARNING",
    documentsCount: 1260,
    occurrences: 1514,
    count: 1514,
  },
  {
    code: "INPUT_OUTPUT_NCM_MISMATCH",
    title: "NCM divergente entre entrada e saída",
    description:
      "Produtos equivalentes aparecem com NCM divergente entre operações de entrada, saída e devolução.",
    severity: "WARNING",
    documentsCount: 980,
    occurrences: 1011,
    count: 1011,
  },
  {
    code: "ITEM_TOTAL_MISMATCH",
    title: "Total do item divergente",
    description:
      "Totais de itens apresentam diferença após recomposição de frete, desconto e despesas acessórias.",
    severity: "INFO",
    documentsCount: 840,
    occurrences: 438,
    count: 438,
  },
];

const ITATIAIA_DEMO_DOCUMENTS_WITH_DIVERGENCES: BatchAnalysisDocument[] = [
  ["NFe_53170323456789000112550010002188161017395372.xml", 8, 47],
  ["NFe_53170323456789000112550010002188171017395477.xml", 9, 63],
  ["NFe_53170323456789000112550010002188261017396405.xml", 7, 52],
  ["NFe_53170823456789000112550010003994061025177344.xml", 6, 38],
  ["NFe_53180223456789000112550010005577101033211498.xml", 7, 45],
  ["NFe_53200423456789000112550010009142071047793102.xml", 8, 56],
  ["NFe_53200723456789000112550010010988431052800761.xml", 6, 42],
  ["NFe_53201023456789000112550010012877061058540317.xml", 7, 49],
  ["NFe_53210623456789000112550010016355021074490152.xml", 8, 71],
  ["NFe_53220123456789000112550010018192011086170240.xml", 5, 36],
].map(([originalName, divergencesCount, items], index) => ({
  id: `itatiaia-demo-file-div-${index + 1}`,
  fileId: `itatiaia-demo-file-div-${index + 1}`,
  originalName: String(originalName),
  divergencesCount: Number(divergencesCount),
  items: Number(items),
}));

const ITATIAIA_DEMO_DOCUMENTS_WITH_ERRORS: BatchAnalysisDocument[] = [
  {
    id: "itatiaia-demo-file-error-1",
    fileId: "itatiaia-demo-file-error-1",
    originalName: "NFe_53210823456789000112550010016900871077845012.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com inconsistência no vínculo entre item de devolução e operação de referência.",
  },
  {
    id: "itatiaia-demo-file-error-2",
    fileId: "itatiaia-demo-file-error-2",
    originalName: "NFe_53211123456789000112550010017655251082211408.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com parâmetro fiscal ausente para item de material elétrico.",
  },
];

const ITATIAIA_DEMO_FISCAL_NOTES: BatchAnalysisFiscalNote[] = [
  {
    note: "Itens elétricos de baixa tensão concentram diferenças de tratamento fiscal e recomposição de ST.",
    documentsCount: 6200,
    occurrences: 34053,
  },
  {
    note: "A maior parte das ocorrências está em CST 0 com CFOP 5102, exigindo revisão de base própria e débito complementar.",
    documentsCount: 5100,
    occurrences: 262509,
  },
  {
    note: "Operações com devolução parcial exigem recomposição de crédito e análise da nota fiscal de referência.",
    documentsCount: 1700,
    occurrences: 1211,
  },
  {
    note: "Combinações de NCM, CEST e anexo fiscal foram priorizadas para tomadas, interruptores, transformadores e tubos.",
    documentsCount: 3600,
    occurrences: 15258,
  },
];

export const ITATIAIA_DEMO_BATCH_ANALYSIS: BatchAnalysisResponse = {
  batch: ITATIAIA_DEMO_BATCH_SUMMARY,
  period: {
    startIssuedAt: "2017-03-01T00:00:00.000Z",
    endIssuedAt: "2022-01-31T23:59:59.000Z",
  },
  summary: {
    totalDocuments: 19860,
    totalProcessed: 19854,
    totalWithDivergences: 14720,
    totalWithErrors: 2,
    totalDivergences: ITATIAIA_DEMO_DIVERGENCES.length,
  },
  divergences: ITATIAIA_DEMO_DIVERGENCES,
  fiscalNotes: ITATIAIA_DEMO_FISCAL_NOTES,
  documents: {
    withDivergences: ITATIAIA_DEMO_DOCUMENTS_WITH_DIVERGENCES,
    withErrors: ITATIAIA_DEMO_DOCUMENTS_WITH_ERRORS,
  },
};

export const ITATIAIA_DEMO_FINANCIALS = {
  metrics: [
    {
      label: "Base operação própria",
      value: 94417402.88,
      helper: "Base apurada nas operações próprias",
      tone: "indigo",
    },
    {
      label: "Crédito a restituir",
      value: 182375.81,
      helper: "Diferença entre crédito declarado e crédito apurado",
      tone: "emerald",
    },
    {
      label: "Base operação ST",
      value: 122951458.02,
      helper: "Base apurada para operação com substituição tributária",
      tone: "amber",
    },
    {
      label: "Débito a complementar",
      value: 12843897.06,
      helper: "Diferença entre débito declarado e apurado",
      tone: "rose",
    },
    {
      label: "ICMS ST declarado",
      value: 1894492.8,
      helper: "Total declarado pelo contribuinte",
      tone: "neutral",
    },
    {
      label: "ICMS ST apurado",
      value: 5029314.16,
      helper: "Total apurado pela revisão fiscal",
      tone: "rose",
    },
    {
      label: "Diferença total apurada",
      value: 2540226.2,
      helper: "Resultado consolidado após devoluções e ajustes",
      tone: "rose",
    },
    {
      label: "Impacto fiscal estimado",
      value: 2540226.2,
      helper: "Diferença consolidada para revisão fiscal",
      tone: "rose",
    },
  ],
  valueDivergences: [
    {
      code: "MISSING_ST_TREATMENT",
      title: "Tratamento de ST não aplicado",
      estimatedImpact: 1328840.92,
      documentsCount: 6200,
      occurrences: 34053,
      severity: "CRITICAL",
    },
    {
      code: "OWN_OPERATION_BASE_MISMATCH",
      title: "Base própria recomposta",
      estimatedImpact: 71642.5,
      documentsCount: 5100,
      occurrences: 262509,
      severity: "ERROR",
    },
    {
      code: "INTERNAL_RATE_MISMATCH",
      title: "Alíquota interna revisada",
      estimatedImpact: 582460.35,
      documentsCount: 4200,
      occurrences: 28121,
      severity: "ERROR",
    },
    {
      code: "INVALID_CEST_NCM_COMBINATION",
      title: "Combinação CEST/NCM incompatível",
      estimatedImpact: 410180.66,
      documentsCount: 3600,
      occurrences: 15258,
      severity: "WARNING",
    },
    {
      code: "CFOP_ST_MISMATCH",
      title: "CFOP incompatível com ST",
      estimatedImpact: 194728.48,
      documentsCount: 3100,
      occurrences: 11943,
      severity: "ERROR",
    },
  ],
  topDocuments: [
    {
      fileName: "NFe_53170323456789000112550010002188171017395477.xml",
      operation: "Saída",
      difference: 87420.36,
      reason: "Transformadores e tomadas com tratamento de ST não aplicado.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53170323456789000112550010002188261017396405.xml",
      operation: "Saída",
      difference: 61288.91,
      reason: "Tubos e caixas de passagem com base ST recomposta.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53170323456789000112550010002188161017395372.xml",
      operation: "Entrada",
      difference: 44870.28,
      reason: "Devolução parcial com estorno e crédito divergentes.",
      status: "Atenção",
    },
    {
      fileName: "NFe_53210623456789000112550010016355021074490152.xml",
      operation: "Saída",
      difference: 39811.74,
      reason: "NCM e CEST incompatíveis em itens de material elétrico.",
      status: "Atenção",
    },
  ],
} as const;

export const ITATIAIA_DEMO_DEMONSTRATIVE_ROWS: DemoDemonstrativeRow[] = [
  {
    document: "218816",
    product: "LUX 2 MOD INT SIMP 10A",
    ncm: "85365090",
    cest: "1200600",
    cfop: "1202",
    cst: "00",
    internalRate: 12,
    mva: 30.52,
    baseReduction: 41.67,
    ownOperationBase: 27110,
    credit: 4880,
    stBase: 20640,
    debit: 2480,
    declaredSt: 0,
    calculatedSt: 580,
    divergence: -580,
    fiscalInfo: "Devolução parcial com recomposição de base e crédito da operação de referência.",
  },
  {
    document: "218817",
    product: "TRANSFORMADOR P/DICR. 12V 50W 220V",
    ncm: "85044029",
    cest: "1201100",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 38.55,
    baseReduction: 0,
    ownOperationBase: 65790,
    credit: 11840,
    stBase: 91150,
    debit: 16410,
    declaredSt: 0,
    calculatedSt: 4570,
    divergence: 4570,
    fiscalInfo: "Tratamento de ST não aplicado em equipamento elétrico sujeito ao regime.",
  },
  {
    document: "218817",
    product: "LUX 2 MOD.TOMADA 2P+T PB 10A",
    ncm: "85366910",
    cest: "1200700",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 30.52,
    baseReduction: 41.67,
    ownOperationBase: 22500,
    credit: 4050,
    stBase: 17130,
    debit: 2060,
    declaredSt: 0,
    calculatedSt: 490,
    divergence: 490,
    fiscalInfo: "Redução de base e alíquota interna revisadas para item elétrico.",
  },
  {
    document: "218817",
    product: "LUX 2 MOD INT. PARALELO",
    ncm: "85365090",
    cest: "1200600",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 30.52,
    baseReduction: 41.67,
    ownOperationBase: 6700,
    credit: 1210,
    stBase: 5100,
    debit: 610,
    declaredSt: 0,
    calculatedSt: 140,
    divergence: 140,
    fiscalInfo: "Diferença residual por recomposição de base ST e crédito.",
  },
  {
    document: "218817",
    product: "BOCAL DECORATIVO BRANCO 100W E27",
    ncm: "85366100",
    cest: "1200500",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 30.52,
    baseReduction: 0,
    ownOperationBase: 3800,
    credit: 680,
    stBase: 4960,
    debit: 890,
    declaredSt: 0,
    calculatedSt: 210,
    divergence: 210,
    fiscalInfo: "Conector elétrico com complemento de ST apurado.",
  },
  {
    document: "218826",
    product: "TUBO ELET CONDULETE 1/2 S/R",
    ncm: "39172300",
    cest: "1008200",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 26.51,
    baseReduction: 0,
    ownOperationBase: 37560,
    credit: 6760,
    stBase: 47520,
    debit: 8550,
    declaredSt: 0,
    calculatedSt: 1790,
    divergence: 1790,
    fiscalInfo: "Tubo plástico para construção com enquadramento ST revisado.",
  },
  {
    document: "218826",
    product: "CAIXA DE PASSAGEM 4X2 CZ-18.01",
    ncm: "39172300",
    cest: "1008200",
    cfop: "5102",
    cst: "00",
    internalRate: 18,
    mva: 26.51,
    baseReduction: 0,
    ownOperationBase: 20900,
    credit: 3760,
    stBase: 26440,
    debit: 4760,
    declaredSt: 0,
    calculatedSt: 1000,
    divergence: 1000,
    fiscalInfo: "Base de ST recomposta para acessório plástico de construção.",
  },
  {
    document: "399406",
    product: "ADAPTADOR CROMADO P/FILTRO 1/2X1/4",
    ncm: "74122000",
    cest: "1006500",
    cfop: "5403",
    cst: "10",
    internalRate: 18,
    mva: 33.08,
    baseReduction: 0,
    ownOperationBase: 184600,
    credit: 33228,
    stBase: 245650,
    debit: 44217,
    declaredSt: 14880,
    calculatedSt: 10989,
    divergence: 10989,
    fiscalInfo: "Acessório de cobre com combinação CEST/NCM revisada e débito complementar.",
  },
];

export const ITATIAIA_DEMO_BATCH_FILES: FileRecord[] = [
  ...ITATIAIA_DEMO_DOCUMENTS_WITH_DIVERGENCES,
  ...ITATIAIA_DEMO_DOCUMENTS_WITH_ERRORS,
].map((document, index) => ({
  id: document.fileId ?? `itatiaia-demo-file-${index + 1}`,
  originalName: document.originalName ?? `NFe_serra_azul_${index + 1}.xml`,
  mimeType: "application/xml",
  size: 176000 + index * 10680,
  status: document.error ? "ERROR" : "PROCESSED",
  createdAt: `2022-01-${String((index % 28) + 1).padStart(2, "0")}T${String(8 + (index % 9)).padStart(2, "0")}:50:00.000Z`,
  updatedAt: ITATIAIA_DEMO_UPDATED_AT,
  uploadedBy: DEMO_FILE_UPLOADER,
}));

const GLASS_DEMO_DIVERGENCES: BatchAnalysisDivergence[] = [
  {
    code: "ICMS_ST_VALUE_MISMATCH",
    title: "Valor de ICMS ST divergente",
    description:
      "Valor de ICMS ST apurado em operações com vidros planos, temperados e laminados supera o valor declarado.",
    severity: "CRITICAL",
    documentsCount: 2860,
    occurrences: 9582,
    count: 9582,
  },
  {
    code: "INTERNAL_RATE_MISMATCH",
    title: "Alíquota interna divergente",
    description:
      "Alíquotas internas aplicadas em vidros temperados e laminados divergem dos parâmetros fiscais considerados.",
    severity: "ERROR",
    documentsCount: 2410,
    occurrences: 6133,
    count: 6133,
  },
  {
    code: "MISSING_ST_TREATMENT",
    title: "Tratamento de ST não aplicado",
    description:
      "Itens classificados como vidros sujeitos à substituição tributária foram emitidos sem complemento de ST compatível.",
    severity: "ERROR",
    documentsCount: 1980,
    occurrences: 15893,
    count: 15893,
  },
  {
    code: "INVALID_CEST_NCM_COMBINATION",
    title: "Combinação inválida entre CEST e NCM",
    description:
      "Combinações de NCM e CEST foram revisadas para vidros float, temperados e laminados vinculados ao anexo fiscal.",
    severity: "WARNING",
    documentsCount: 1220,
    occurrences: 4860,
    count: 4860,
  },
  {
    code: "OWN_OPERATION_BASE_MISMATCH",
    title: "Base da operação própria divergente",
    description:
      "Base declarada da operação própria diverge da base apurada após revisão de IPI, descontos e frete.",
    severity: "WARNING",
    documentsCount: 960,
    occurrences: 6133,
    count: 6133,
  },
  {
    code: "CFOP_ST_MISMATCH",
    title: "CFOP incompatível com substituição tributária",
    description:
      "Operações com mercadorias sujeitas ao regime foram emitidas com CFOP de venda própria ou devolução sem tratamento fiscal correspondente.",
    severity: "ERROR",
    documentsCount: 740,
    occurrences: 172,
    count: 172,
  },
  {
    code: "UNEXPECTED_BASE_REDUCTION",
    title: "Redução de base aplicada indevidamente",
    description:
      "Reduções de base foram aplicadas em itens cujo parâmetro fiscal não indicava redução para a operação analisada.",
    severity: "WARNING",
    documentsCount: 620,
    occurrences: 154,
    count: 154,
  },
  {
    code: "TAX_SUBSTITUTE_ANNEX_MISMATCH",
    title: "Substituto tributário incompatível com o anexo",
    description:
      "Produtos de vidro foram vinculados a classificação de anexo incompatível com o tratamento fiscal aplicado.",
    severity: "WARNING",
    documentsCount: 530,
    occurrences: 1510,
    count: 1510,
  },
  {
    code: "INPUT_OUTPUT_TAX_TREATMENT_MISMATCH",
    title: "Tratamento fiscal incompatível entre entrada e saída",
    description:
      "O tratamento fiscal das saídas de vidro diverge do enquadramento observado nas entradas correspondentes.",
    severity: "WARNING",
    documentsCount: 410,
    occurrences: 394,
    count: 394,
  },
  {
    code: "ITEM_TOTAL_MISMATCH",
    title: "Total do item divergente",
    description:
      "Totais de itens em chapas de vidro apresentam diferença após recomposição de quantidade, valor unitário e IPI.",
    severity: "INFO",
    documentsCount: 280,
    occurrences: 159,
    count: 159,
  },
];

const GLASS_DEMO_DOCUMENTS_WITH_DIVERGENCES: BatchAnalysisDocument[] = [
  ["NFe_53170334567890000145550010003302541013484545.xml", 7, 24],
  ["NFe_53170334567890000145550010003302551013484534.xml", 6, 31],
  ["NFe_53170334567890000145550010003302641013485114.xml", 8, 44],
  ["NFe_53170334567890000145550010003302651013485103.xml", 7, 39],
  ["NFe_53170334567890000145550010003302671013485159.xml", 7, 46],
  ["NFe_53170334567890000145550010003302691013485200.xml", 8, 53],
  ["NFe_53170834567890000145550010004177021024810311.xml", 5, 28],
  ["NFe_53191234567890000145550010007366411045278219.xml", 6, 35],
  ["NFe_53200834567890000145550010009285071055244108.xml", 7, 42],
  ["NFe_53220134567890000145550010011890111086200344.xml", 5, 27],
].map(([originalName, divergencesCount, items], index) => ({
  id: `glass-demo-file-div-${index + 1}`,
  fileId: `glass-demo-file-div-${index + 1}`,
  originalName: String(originalName),
  divergencesCount: Number(divergencesCount),
  items: Number(items),
}));

const GLASS_DEMO_DOCUMENTS_WITH_ERRORS: BatchAnalysisDocument[] = [
  {
    id: "glass-demo-file-error-1",
    fileId: "glass-demo-file-error-1",
    originalName: "NFe_53200934567890000145550010009644111056993021.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com produto sem vínculo fiscal válido para o grupo de vidros laminados.",
  },
  {
    id: "glass-demo-file-error-2",
    fileId: "glass-demo-file-error-2",
    originalName: "NFe_53211134567890000145550010011380701082111804.xml",
    divergencesCount: 0,
    items: 0,
    error: "Documento com inconsistência na unidade de medida do item fiscal.",
  },
];

const GLASS_DEMO_FISCAL_NOTES: BatchAnalysisFiscalNote[] = [
  {
    note: "Produtos de vidro plano, temperado e laminado concentram diferenças entre ICMS ST declarado e apurado.",
    documentsCount: 2860,
    occurrences: 9582,
  },
  {
    note: "Operações de produção própria com CFOP 5101 exigem revisão do enquadramento fiscal aplicado aos itens de vidro.",
    documentsCount: 2410,
    occurrences: 9582,
  },
  {
    note: "Vidros laminados revisados apresentam alteração de classificação fiscal e impacto direto no cálculo de ST.",
    documentsCount: 1220,
    occurrences: 4860,
  },
  {
    note: "Devoluções e entradas residuais foram mantidas na análise para recomposição de crédito e diferença de operação própria.",
    documentsCount: 740,
    occurrences: 159,
  },
];

export const GLASS_DEMO_BATCH_ANALYSIS: BatchAnalysisResponse = {
  batch: GLASS_DEMO_BATCH_SUMMARY,
  period: {
    startIssuedAt: "2017-03-01T00:00:00.000Z",
    endIssuedAt: "2022-01-31T23:59:59.000Z",
  },
  summary: {
    totalDocuments: 6420,
    totalProcessed: 6417,
    totalWithDivergences: 5180,
    totalWithErrors: 2,
    totalDivergences: GLASS_DEMO_DIVERGENCES.length,
  },
  divergences: GLASS_DEMO_DIVERGENCES,
  fiscalNotes: GLASS_DEMO_FISCAL_NOTES,
  documents: {
    withDivergences: GLASS_DEMO_DOCUMENTS_WITH_DIVERGENCES,
    withErrors: GLASS_DEMO_DOCUMENTS_WITH_ERRORS,
  },
};

export const GLASS_DEMO_FINANCIALS = {
  metrics: [
    {
      label: "Base operação própria",
      value: 14922522.88,
      helper: "Base apurada nas operações próprias",
      tone: "indigo",
    },
    {
      label: "Crédito a restituir",
      value: 42551.8,
      helper: "Diferença entre crédito declarado e crédito apurado",
      tone: "emerald",
    },
    {
      label: "Base operação ST",
      value: 20922499.3,
      helper: "Base apurada para operação com substituição tributária",
      tone: "amber",
    },
    {
      label: "Débito a complementar",
      value: 2605141.97,
      helper: "Diferença entre débito declarado e apurado",
      tone: "rose",
    },
    {
      label: "ICMS ST declarado",
      value: 313.05,
      helper: "Total declarado pelo contribuinte",
      tone: "neutral",
    },
    {
      label: "ICMS ST apurado",
      value: 751562.68,
      helper: "Total apurado pela revisão fiscal",
      tone: "rose",
    },
    {
      label: "Diferença total apurada",
      value: 751249.63,
      helper: "Resultado consolidado após devoluções e ajustes",
      tone: "rose",
    },
    {
      label: "Impacto fiscal estimado",
      value: 751249.63,
      helper: "Diferença consolidada para revisão fiscal",
      tone: "rose",
    },
  ],
  valueDivergences: [
    {
      code: "ICMS_ST_VALUE_MISMATCH",
      title: "ICMS ST declarado x apurado",
      estimatedImpact: 751249.63,
      documentsCount: 2860,
      occurrences: 9582,
      severity: "CRITICAL",
    },
    {
      code: "INTERNAL_RATE_MISMATCH",
      title: "Alíquota interna revisada em vidros",
      estimatedImpact: 312840.42,
      documentsCount: 2410,
      occurrences: 6133,
      severity: "ERROR",
    },
    {
      code: "MISSING_ST_TREATMENT",
      title: "Tratamento de ST não aplicado",
      estimatedImpact: 228615.7,
      documentsCount: 1980,
      occurrences: 15893,
      severity: "ERROR",
    },
    {
      code: "INVALID_CEST_NCM_COMBINATION",
      title: "Combinação CEST/NCM incompatível",
      estimatedImpact: 98640.35,
      documentsCount: 1220,
      occurrences: 4860,
      severity: "WARNING",
    },
    {
      code: "OWN_OPERATION_BASE_MISMATCH",
      title: "Base própria recomposta",
      estimatedImpact: 42551.8,
      documentsCount: 960,
      occurrences: 6133,
      severity: "WARNING",
    },
  ],
  topDocuments: [
    {
      fileName: "NFe_53170334567890000145550010003302691013485200.xml",
      operation: "Saída",
      difference: 48260.78,
      reason: "Vidro laminado refletivo com ICMS ST apurado acima do declarado.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53170334567890000145550010003302671013485159.xml",
      operation: "Saída",
      difference: 36690.41,
      reason: "Vidro temperado com alíquota interna e MVA revisadas.",
      status: "Crítico",
    },
    {
      fileName: "NFe_53170334567890000145550010003302551013484534.xml",
      operation: "Saída",
      difference: 22148.33,
      reason: "Vidro float com complemento de ST por diferença de base.",
      status: "Atenção",
    },
    {
      fileName: "NFe_53170334567890000145550010003302541013484545.xml",
      operation: "Saída",
      difference: 17490.12,
      reason: "Chapa de vidro plano com CEST/NCM revisados.",
      status: "Atenção",
    },
  ],
} as const;

export const GLASS_DEMO_DEMONSTRATIVE_ROWS: DemoDemonstrativeRow[] = [
  {
    document: "330254",
    product: "CRISTAL PLANO INCOLOR 4MM - CHAPA 1605 X 2200",
    ncm: "70052900",
    cest: "1003500",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 31.33,
    baseReduction: 0,
    ownOperationBase: 73620,
    credit: 8830,
    stBase: 101520,
    debit: 12180,
    declaredSt: 0,
    calculatedSt: 3350,
    divergence: 3350,
    fiscalInfo: "Vidro float com base ST apurada acima da base declarada.",
  },
  {
    document: "330255",
    product: "CRISTAL PLANO INCOLOR 4MM - CHAPA 3210 X 2400",
    ncm: "70052900",
    cest: "1003500",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 31.33,
    baseReduction: 0,
    ownOperationBase: 180970,
    credit: 21720,
    stBase: 249550,
    debit: 29950,
    declaredSt: 0,
    calculatedSt: 8230,
    divergence: 8230,
    fiscalInfo: "Operação com vidro plano sujeita à recomposição de ST.",
  },
  {
    document: "330264",
    product: "CRISTAL PLANO INCOLOR 8MM - TEMPERADO COM FURO",
    ncm: "70071900",
    cest: "1003600",
    cfop: "5101",
    cst: "00",
    internalRate: 12,
    mva: 28.92,
    baseReduction: 0,
    ownOperationBase: 59430,
    credit: 7130,
    stBase: 84280,
    debit: 10110,
    declaredSt: 0,
    calculatedSt: 2980,
    divergence: 2980,
    fiscalInfo: "Vidro temperado de produção própria com complemento de ST apurado.",
  },
  {
    document: "330265",
    product: "CRISTAL PLANO INCOLOR 8MM - TEMPERADO",
    ncm: "70071900",
    cest: "1003600",
    cfop: "5101",
    cst: "00",
    internalRate: 12,
    mva: 28.92,
    baseReduction: 0,
    ownOperationBase: 137750,
    credit: 16530,
    stBase: 195350,
    debit: 23440,
    declaredSt: 0,
    calculatedSt: 6910,
    divergence: 6910,
    fiscalInfo: "Alíquota interna e base ST revisadas para vidro temperado.",
  },
  {
    document: "330267",
    product: "CRISTAL PLANO INCOLOR 8MM - TEMPERADO",
    ncm: "70071900",
    cest: "1003600",
    cfop: "5101",
    cst: "00",
    internalRate: 12,
    mva: 28.92,
    baseReduction: 0,
    ownOperationBase: 259910,
    credit: 31190,
    stBase: 368580,
    debit: 44230,
    declaredSt: 0,
    calculatedSt: 13040,
    divergence: 13040,
    fiscalInfo: "Diferença relevante em operação própria e ST de vidro temperado.",
  },
  {
    document: "330269",
    product: "LAMINADO REFLETIVO PRATA H 120STII 44",
    ncm: "70072900",
    cest: "1003700",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 31.33,
    baseReduction: 0,
    ownOperationBase: 999970,
    credit: 120000,
    stBase: 1444590,
    debit: 173350,
    declaredSt: 0,
    calculatedSt: 53350,
    divergence: 53350,
    fiscalInfo: "Vidro laminado com classificação revisada e ST apurada.",
  },
  {
    document: "330269",
    product: "LAMINADO REFLETIVO PRATA H 120STII 44 - CHAPA 1605 X 2200",
    ncm: "70072900",
    cest: "1003700",
    cfop: "5102",
    cst: "00",
    internalRate: 12,
    mva: 31.33,
    baseReduction: 0,
    ownOperationBase: 499980,
    credit: 60000,
    stBase: 722290,
    debit: 86670,
    declaredSt: 0,
    calculatedSt: 26670,
    divergence: 26670,
    fiscalInfo: "Vidro laminado com divergência entre valor declarado e apurado.",
  },
  {
    document: "417702",
    product: "ESPELHO PRATA 4MM LAPIDADO",
    ncm: "70099100",
    cest: "1003900",
    cfop: "5401",
    cst: "10",
    internalRate: 12,
    mva: 31.33,
    baseReduction: 0,
    ownOperationBase: 386450,
    credit: 46374,
    stBase: 507560,
    debit: 60907,
    declaredSt: 313.05,
    calculatedSt: 14533,
    divergence: 14219.95,
    fiscalInfo: "Espelho com operação de produção própria e ST declarada inferior ao apurado.",
  },
];

export const GLASS_DEMO_BATCH_FILES: FileRecord[] = [
  ...GLASS_DEMO_DOCUMENTS_WITH_DIVERGENCES,
  ...GLASS_DEMO_DOCUMENTS_WITH_ERRORS,
].map((document, index) => ({
  id: document.fileId ?? `glass-demo-file-${index + 1}`,
  originalName: document.originalName ?? `NFe_horizonte_vidros_${index + 1}.xml`,
  mimeType: "application/xml",
  size: 164000 + index * 8680,
  status: document.error ? "ERROR" : "PROCESSED",
  createdAt: `2022-01-${String((index % 28) + 1).padStart(2, "0")}T${String(8 + (index % 9)).padStart(2, "0")}:10:00.000Z`,
  updatedAt: GLASS_DEMO_UPDATED_AT,
  uploadedBy: DEMO_FILE_UPLOADER,
}));

const DEMO_BATCH_RECORDS = [
  GLASS_DEMO_BATCH_RECORD,
  ITATIAIA_DEMO_BATCH_RECORD,
  CONSTRUCTION_DEMO_BATCH_RECORD,
  FISCAL_DEMO_BATCH_RECORD,
  DEMO_BATCH_RECORD,
];

function getDemoBatchRecord(batchId: string | null | undefined): BatchRecord | null {
  return DEMO_BATCH_RECORDS.find((batch) => batch.id === batchId) ?? null;
}

export function getDemoBatchSummary(batchId: string | null | undefined): BatchSummary | null {
  if (batchId === GLASS_DEMO_BATCH_ID) {
    return GLASS_DEMO_BATCH_SUMMARY;
  }

  if (batchId === ITATIAIA_DEMO_BATCH_ID) {
    return ITATIAIA_DEMO_BATCH_SUMMARY;
  }

  if (batchId === CONSTRUCTION_DEMO_BATCH_ID) {
    return CONSTRUCTION_DEMO_BATCH_SUMMARY;
  }

  if (batchId === FISCAL_DEMO_BATCH_ID) {
    return FISCAL_DEMO_BATCH_SUMMARY;
  }

  if (batchId === DEMO_BATCH_ID) {
    return DEMO_BATCH_SUMMARY;
  }

  return null;
}

export function getDemoBatchAnalysis(batchId: string | null | undefined): BatchAnalysisResponse | null {
  if (batchId === GLASS_DEMO_BATCH_ID) {
    return GLASS_DEMO_BATCH_ANALYSIS;
  }

  if (batchId === ITATIAIA_DEMO_BATCH_ID) {
    return ITATIAIA_DEMO_BATCH_ANALYSIS;
  }

  if (batchId === CONSTRUCTION_DEMO_BATCH_ID) {
    return CONSTRUCTION_DEMO_BATCH_ANALYSIS;
  }

  if (batchId === FISCAL_DEMO_BATCH_ID) {
    return FISCAL_DEMO_BATCH_ANALYSIS;
  }

  if (batchId === DEMO_BATCH_ID) {
    return DEMO_BATCH_ANALYSIS;
  }

  return null;
}

export function getDemoBatchFinancials(batchId: string | null | undefined) {
  if (batchId === GLASS_DEMO_BATCH_ID) {
    return GLASS_DEMO_FINANCIALS;
  }

  if (batchId === ITATIAIA_DEMO_BATCH_ID) {
    return ITATIAIA_DEMO_FINANCIALS;
  }

  if (batchId === CONSTRUCTION_DEMO_BATCH_ID) {
    return CONSTRUCTION_DEMO_FINANCIALS;
  }

  if (batchId === FISCAL_DEMO_BATCH_ID) {
    return FISCAL_DEMO_FINANCIALS;
  }

  if (batchId === DEMO_BATCH_ID) {
    return DEMO_BATCH_FINANCIALS;
  }

  return null;
}

export function getDemoBatchDemonstrativeRows(batchId: string | null | undefined): DemoDemonstrativeRow[] {
  if (batchId === GLASS_DEMO_BATCH_ID) {
    return GLASS_DEMO_DEMONSTRATIVE_ROWS;
  }

  if (batchId === ITATIAIA_DEMO_BATCH_ID) {
    return ITATIAIA_DEMO_DEMONSTRATIVE_ROWS;
  }

  if (batchId === CONSTRUCTION_DEMO_BATCH_ID) {
    return CONSTRUCTION_DEMO_DEMONSTRATIVE_ROWS;
  }

  return batchId === FISCAL_DEMO_BATCH_ID ? FISCAL_DEMO_DEMONSTRATIVE_ROWS : [];
}

export function getDemoBatchCompanyInfo(batchId: string | null | undefined): DemoCompanyInfo | null {
  return batchId ? DEMO_COMPANY_INFO_BY_BATCH_ID[batchId] ?? null : null;
}

export function isDemoBatchId(batchId: string | null | undefined): boolean {
  return getDemoBatchRecord(batchId) !== null;
}

function normalizeSearch(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function matchesDateFilter(createdAt: string, dateFrom?: string, dateTo?: string): boolean {
  const createdTime = new Date(createdAt).getTime();

  if (dateFrom) {
    const fromTime = new Date(`${dateFrom}T00:00:00`).getTime();
    if (Number.isFinite(fromTime) && createdTime < fromTime) {
      return false;
    }
  }

  if (dateTo) {
    const toTime = new Date(`${dateTo}T23:59:59`).getTime();
    if (Number.isFinite(toTime) && createdTime > toTime) {
      return false;
    }
  }

  return true;
}

export function shouldShowDemoBatch({
  search,
  dateFrom,
  dateTo,
}: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): boolean {
  return countVisibleDemoBatches({ search, dateFrom, dateTo }) > 0;
}

function matchesDemoBatchFilters(
  batch: BatchRecord,
  aliases: string[],
  {
    search,
    dateFrom,
    dateTo,
  }: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): boolean {
  const normalizedSearch = normalizeSearch(search);
  const matchesSearch =
    !normalizedSearch ||
    batch.name.toLowerCase().includes(normalizedSearch) ||
    batch.id.includes(normalizedSearch) ||
    aliases.some((alias) => alias.includes(normalizedSearch));

  return matchesSearch && matchesDateFilter(batch.createdAt, dateFrom, dateTo);
}

function getVisibleDemoBatches({
  search,
  dateFrom,
  dateTo,
}: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): BatchRecord[] {
  return DEMO_BATCH_RECORDS.filter((batch) => {
    const aliases =
      batch.id === GLASS_DEMO_BATCH_ID
        ? [
            "monitoramento st",
            "horizonte vidros",
            "vidros",
            "espelhos",
            "vitrais",
            "vidro plano",
            "vidro temperado",
            "vidro laminado",
            "icms st",
          ]
        : batch.id === ITATIAIA_DEMO_BATCH_ID
        ? [
            "monitoramento st",
            "serra azul",
            "materiais de construcao",
            "materiais de construção",
            "material eletrico",
            "material elétrico",
            "tomadas",
            "interruptores",
            "icms st",
          ]
        : batch.id === CONSTRUCTION_DEMO_BATCH_ID
        ? [
            "monitoramento st",
            "construmax atacadista",
            "construcao",
            "construção",
            "ferragens",
            "materiais de construcao",
            "materiais de construção",
            "icms st",
          ]
        : batch.id === FISCAL_DEMO_BATCH_ID
          ? [
              "monitoramento st",
              "cia brasileira de distribuicao",
              "cia brasileira de distribuição",
              "notificacao monitoramento",
              "demonstrativo fiscal",
              "icms st",
            ]
          : ["supermercado padrao", "supermercado padrão", "auditoria fiscal"];

    return matchesDemoBatchFilters(batch, aliases, { search, dateFrom, dateTo });
  });
}

export function countVisibleDemoBatches(params: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): number {
  return getVisibleDemoBatches(params).length;
}

export function mergeDemoBatchIntoFirstPage({
  batches,
  page,
  pageSize,
  search,
  dateFrom,
  dateTo,
}: {
  batches: BatchRecord[];
  page: number;
  pageSize: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): BatchRecord[] {
  const visibleDemoBatches = getVisibleDemoBatches({ search, dateFrom, dateTo });

  if (page !== 1 || visibleDemoBatches.length === 0) {
    return batches;
  }

  const demoIds = new Set(DEMO_BATCH_RECORDS.map((batch) => batch.id));
  const withoutDuplicate = batches.filter((batch) => !demoIds.has(batch.id));
  return [...visibleDemoBatches, ...withoutDuplicate].slice(0, pageSize);
}

export function filterDemoBatchFiles({
  batchId,
  search,
  dateFrom,
  dateTo,
}: {
  batchId?: string | null;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): FileRecord[] {
  const normalizedSearch = normalizeSearch(search);
  const files =
    batchId === GLASS_DEMO_BATCH_ID
      ? GLASS_DEMO_BATCH_FILES
      : batchId === ITATIAIA_DEMO_BATCH_ID
      ? ITATIAIA_DEMO_BATCH_FILES
      : batchId === CONSTRUCTION_DEMO_BATCH_ID
      ? CONSTRUCTION_DEMO_BATCH_FILES
      : batchId === FISCAL_DEMO_BATCH_ID
        ? FISCAL_DEMO_BATCH_FILES
        : DEMO_BATCH_FILES;

  return files.filter((file) => {
    const matchesSearch = !normalizedSearch || file.originalName.toLowerCase().includes(normalizedSearch);
    return matchesSearch && matchesDateFilter(file.createdAt, dateFrom, dateTo);
  });
}

export function buildDemoXmlBlob(fileName: string, batchId?: string | null): Blob {
  const batchName = getDemoBatchSummary(batchId)?.name ?? DEMO_BATCH_NAME;
  const period =
    batchId === GLASS_DEMO_BATCH_ID
      ? 'start="2017-03-01" end="2022-01-31"'
      : batchId === ITATIAIA_DEMO_BATCH_ID
      ? 'start="2017-03-01" end="2022-01-31"'
      : batchId === CONSTRUCTION_DEMO_BATCH_ID
      ? 'start="2017-03-01" end="2022-01-31"'
      : batchId === FISCAL_DEMO_BATCH_ID
      ? 'start="2020-03-01" end="2022-01-31"'
      : 'start="2025-01-01" end="2025-01-31"';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<auditDocument>\n  <batch>${batchName}</batch>\n  <file>${fileName}</file>\n  <period ${period} />\n  <status>processed</status>\n</auditDocument>\n`;
  return new Blob([xml], { type: "application/xml" });
}
