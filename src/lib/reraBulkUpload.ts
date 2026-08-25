export type ReraDocumentGroup = "rera" | "project";

export type ReraDocumentDefinition = {
  key: string;
  label: string;
  annexure?: string;
  group: ReraDocumentGroup;
  aliases: string[];
};

export const RERA_DOCUMENT_DEFINITIONS: ReraDocumentDefinition[] = [
  { key: "registration-certificate", label: "Registration Certificate", annexure: "Annexure 1", group: "rera", aliases: ["registration certificate", "project registration certificate", "rera registration certificate", "reg certificate"] },
  { key: "certificate-of-incorporation", label: "Certificate of Incorporation", group: "rera", aliases: ["certificate of incorporation", "incorporation certificate", "company incorporation"] },
  { key: "memorandum-of-association", label: "Memorandum of Association", annexure: "Annexure 15", group: "rera", aliases: ["memorandum of association", "memorandum association", "moa"] },
  { key: "articles-of-association", label: "Articles of Association", annexure: "Annexure 16", group: "rera", aliases: ["articles of association", "article of association", "articles association", "aoa"] },
  { key: "pan-card", label: "PAN Card", annexure: "Annexure 2", group: "rera", aliases: ["pan card", "pancard", "promoter pan", "company pan"] },
];

export const PROJECT_DOCUMENT_DEFINITIONS: ReraDocumentDefinition[] = [
  { key: "commencement-certificate", label: "Commencement Certificate", annexure: "Annexure 80", group: "project", aliases: ["commencement certificate", "commencement cert"] },
  { key: "approved-building-plan", label: "Approved Building Plan", annexure: "Annexure 81", group: "project", aliases: ["approved building plan", "building plan approval", "sanctioned building plan"] },
  { key: "sectional-drawing", label: "Sectional Drawing of the Apartments", annexure: "Annexure 82", group: "project", aliases: ["sectional drawing of the apartments", "sectional drawing", "apartment sectional drawing"] },
  { key: "structural-safety-certificate", label: "Structural Safety Certificate from Registered Engineer", annexure: "Annexure 83", group: "project", aliases: ["structural safety certificate", "structure safety certificate", "registered engineer certificate"] },
  { key: "project-specifications", label: "Project Specifications", annexure: "Annexure 84", group: "project", aliases: ["project specifications", "project specification", "specifications of project"] },
  { key: "brochure", label: "Brochure", annexure: "Annexure 85", group: "project", aliases: ["project brochure", "brochure"] },
  { key: "relinquishment-deed", label: "Relinquishment Deed", annexure: "Annexure 86", group: "project", aliases: ["relinquishment deed", "release deed"] },
  { key: "agreement-for-sale", label: "Proforma of Agreement for Sale", annexure: "Annexure 87", group: "project", aliases: ["proforma of agreement for sale", "agreement for sale", "sale agreement proforma"] },
  { key: "allotment-letter", label: "Proforma of Allotment Letter", annexure: "Annexure 88", group: "project", aliases: ["proforma of allotment letter", "allotment letter", "allotment letter proforma"] },
];

export const ALL_RERA_DOCUMENT_DEFINITIONS = [
  ...RERA_DOCUMENT_DEFINITIONS,
  ...PROJECT_DOCUMENT_DEFINITIONS,
];

export type ReraFileMatch = {
  definition?: ReraDocumentDefinition;
  confidence: "high" | "medium" | "none";
  reason: string;
};

export function normalizeUploadFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function annexureNumber(value?: string) {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

function filenameAnnexure(value: string) {
  const explicit = value.match(/\b(?:annexure|annex|annx|ann)\s*0*(\d{1,3})\b/i);
  if (explicit) return Number(explicit[1]);
  const standalone = value.match(/^0*(\d{1,3})$/);
  return standalone ? Number(standalone[1]) : undefined;
}

function words(value: string) {
  return new Set(value.split(" ").filter((word) => word.length > 1 && !["the", "of", "for", "from"].includes(word)));
}

export function classifyReraFileName(fileName: string): ReraFileMatch {
  const normalized = normalizeUploadFileName(fileName);
  if (!normalized) return { confidence: "none", reason: "The filename is empty." };

  const annexure = filenameAnnexure(normalized);
  if (annexure !== undefined) {
    const definition = ALL_RERA_DOCUMENT_DEFINITIONS.find((item) => annexureNumber(item.annexure) === annexure);
    if (definition) return { definition, confidence: "high", reason: `Matched ${definition.annexure}.` };
  }

  const aliasMatches = ALL_RERA_DOCUMENT_DEFINITIONS.filter((definition) => definition.aliases.some((alias) => {
    const normalizedAlias = normalizeUploadFileName(alias);
    return normalized === normalizedAlias || normalized.includes(normalizedAlias);
  }));
  if (aliasMatches.length === 1) {
    return { definition: aliasMatches[0], confidence: "high", reason: "Matched the document name." };
  }

  const fileWords = words(normalized);
  const scored = ALL_RERA_DOCUMENT_DEFINITIONS.map((definition) => {
    const labelWords = words(normalizeUploadFileName(definition.label));
    const matched = [...labelWords].filter((word) => fileWords.has(word)).length;
    return { definition, score: labelWords.size ? matched / labelWords.size : 0, matched };
  }).filter((candidate) => candidate.matched >= 2 && candidate.score >= 0.6)
    .sort((left, right) => right.score - left.score);

  if (scored.length && (!scored[1] || scored[0].score > scored[1].score)) {
    return { definition: scored[0].definition, confidence: "medium", reason: "Possible filename match; please confirm." };
  }

  return { confidence: "none", reason: "Choose the document category before uploading." };
}

export function documentDefinitionByKey(group: ReraDocumentGroup, key: string) {
  return ALL_RERA_DOCUMENT_DEFINITIONS.find((definition) => definition.group === group && definition.key === key);
}
