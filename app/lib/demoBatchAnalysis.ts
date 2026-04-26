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

const DEMO_CREATED_AT = "2025-02-03T13:45:00.000Z";
const DEMO_UPDATED_AT = "2025-02-03T16:20:00.000Z";

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
  originalName: document.originalName ?? `NFe_demo_${index + 1}.xml`,
  mimeType: "application/xml",
  size: 186000 + index * 7340,
  status: document.error ? "ERROR" : "PROCESSED",
  createdAt: `2025-01-${String((index % 28) + 1).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:35:00.000Z`,
  updatedAt: DEMO_UPDATED_AT,
  uploadedBy: DEMO_FILE_UPLOADER,
}));

export function isDemoBatchId(batchId: string | null | undefined): boolean {
  return batchId === DEMO_BATCH_ID;
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
  const normalizedSearch = normalizeSearch(search);
  const matchesSearch =
    !normalizedSearch ||
    DEMO_BATCH_NAME.toLowerCase().includes(normalizedSearch) ||
    DEMO_BATCH_ID.includes(normalizedSearch) ||
    "supermercado padrao".includes(normalizedSearch) ||
    "auditoria fiscal demo".includes(normalizedSearch);

  return matchesSearch && matchesDateFilter(DEMO_BATCH_RECORD.createdAt, dateFrom, dateTo);
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
  if (page !== 1 || !shouldShowDemoBatch({ search, dateFrom, dateTo })) {
    return batches;
  }

  const withoutDuplicate = batches.filter((batch) => batch.id !== DEMO_BATCH_ID);
  return [DEMO_BATCH_RECORD, ...withoutDuplicate].slice(0, pageSize);
}

export function filterDemoBatchFiles({
  search,
  dateFrom,
  dateTo,
}: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): FileRecord[] {
  const normalizedSearch = normalizeSearch(search);

  return DEMO_BATCH_FILES.filter((file) => {
    const matchesSearch = !normalizedSearch || file.originalName.toLowerCase().includes(normalizedSearch);
    return matchesSearch && matchesDateFilter(file.createdAt, dateFrom, dateTo);
  });
}

export function buildDemoXmlBlob(fileName: string): Blob {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<demoAuditDocument>\n  <batch>${DEMO_BATCH_NAME}</batch>\n  <file>${fileName}</file>\n  <period start="2025-01-01" end="2025-01-31" />\n  <status>mocked-demo</status>\n</demoAuditDocument>\n`;
  return new Blob([xml], { type: "application/xml" });
}
