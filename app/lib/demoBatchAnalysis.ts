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

const DEMO_CREATED_AT = "2025-02-03T13:45:00.000Z";
const DEMO_UPDATED_AT = "2025-02-03T16:20:00.000Z";
const FISCAL_DEMO_CREATED_AT = "2025-03-10T10:20:00.000Z";
const FISCAL_DEMO_UPDATED_AT = "2025-03-10T15:40:00.000Z";

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

const DEMO_BATCH_RECORDS = [FISCAL_DEMO_BATCH_RECORD, DEMO_BATCH_RECORD];

function getDemoBatchRecord(batchId: string | null | undefined): BatchRecord | null {
  return DEMO_BATCH_RECORDS.find((batch) => batch.id === batchId) ?? null;
}

export function getDemoBatchSummary(batchId: string | null | undefined): BatchSummary | null {
  if (batchId === FISCAL_DEMO_BATCH_ID) {
    return FISCAL_DEMO_BATCH_SUMMARY;
  }

  if (batchId === DEMO_BATCH_ID) {
    return DEMO_BATCH_SUMMARY;
  }

  return null;
}

export function getDemoBatchAnalysis(batchId: string | null | undefined): BatchAnalysisResponse | null {
  if (batchId === FISCAL_DEMO_BATCH_ID) {
    return FISCAL_DEMO_BATCH_ANALYSIS;
  }

  if (batchId === DEMO_BATCH_ID) {
    return DEMO_BATCH_ANALYSIS;
  }

  return null;
}

export function getDemoBatchFinancials(batchId: string | null | undefined) {
  if (batchId === FISCAL_DEMO_BATCH_ID) {
    return FISCAL_DEMO_FINANCIALS;
  }

  if (batchId === DEMO_BATCH_ID) {
    return DEMO_BATCH_FINANCIALS;
  }

  return null;
}

export function getDemoBatchDemonstrativeRows(batchId: string | null | undefined): DemoDemonstrativeRow[] {
  return batchId === FISCAL_DEMO_BATCH_ID ? FISCAL_DEMO_DEMONSTRATIVE_ROWS : [];
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
      batch.id === FISCAL_DEMO_BATCH_ID
        ? [
            "monitoramento st",
            "cia brasileira de distribuicao",
            "cia brasileira de distribuição",
            "notificacao monitoramento",
            "demonstrativo fiscal",
            "icms st",
          ]
        : ["supermercado padrao", "supermercado padrão", "auditoria fiscal demo"];

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
  const files = batchId === FISCAL_DEMO_BATCH_ID ? FISCAL_DEMO_BATCH_FILES : DEMO_BATCH_FILES;

  return files.filter((file) => {
    const matchesSearch = !normalizedSearch || file.originalName.toLowerCase().includes(normalizedSearch);
    return matchesSearch && matchesDateFilter(file.createdAt, dateFrom, dateTo);
  });
}

export function buildDemoXmlBlob(fileName: string, batchId?: string | null): Blob {
  const batchName = getDemoBatchSummary(batchId)?.name ?? DEMO_BATCH_NAME;
  const period =
    batchId === FISCAL_DEMO_BATCH_ID
      ? 'start="2020-03-01" end="2022-01-31"'
      : 'start="2025-01-01" end="2025-01-31"';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<auditDocument>\n  <batch>${batchName}</batch>\n  <file>${fileName}</file>\n  <period ${period} />\n  <status>processed</status>\n</auditDocument>\n`;
  return new Blob([xml], { type: "application/xml" });
}
