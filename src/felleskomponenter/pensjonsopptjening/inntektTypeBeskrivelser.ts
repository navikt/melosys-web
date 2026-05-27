export const INNTEKT_TYPE_BESKRIVELSE: Record<string, string> = {
  SUM_PI: "Sum pensjonsgivende inntekt",
  AI: "Antatt inntekt",
  PI66: "Pensjonsgivende inntekt 1966 (konv.)",
  PGI_NAV: "PGI innland fastsatt av NAV",
  RED_INT: "Reduksjonsinntekt",

  INN_LON: "Innenlandsinntekt — lønn",
  INN_SEL: "Innenlandsinntekt — selvstendig",
  INN_JSF: "Innenlandsinntekt — jord/skog/fisk",

  SJO_LON: "Sjøinntekt — lønn",
  SJO_SEL: "Sjøinntekt — selvstendig",
  SJO_JSF: "Sjøinntekt — jord/skog/fisk",

  UTE_LON: "Utenlandsinntekt — lønn",
  UTE_SEL: "Utenlandsinntekt — selvstendig",
  UTE_JSF: "Utenlandsinntekt — jord/skog/fisk",

  SVA_LON: "Svalbardinntekt — lønn",
  SVA_SEL: "Svalbardinntekt — selvstendig",
  SVA_JSF: "Svalbardinntekt — jord/skog/fisk",

  DIP_LON: "Diplomatinntekt — lønn",
  DIP_SEL: "Diplomatinntekt — selvstendig",
  DIP_JSF: "Diplomatinntekt — jord/skog/fisk",

  FL_PGI_LOENN: "Fastland — pensjonsgivende inntekt av lønn",
  FL_PGI_LOENN_PD: "Fastland — pensjonsgivende inntekt av lønn, bare pensjonsdel",
  FL_PGI_NAERING: "Fastland — pensjonsgivende inntekt av næring",
  FL_PGI_NAERING_FFF: "Fastland — pensjonsgivende inntekt av næring fra fiske, fangst eller familiebarnehage",

  KSL_PGI_LOENN: "Kildeskatt på lønn — pensjonsgivende inntekt av lønn",
  KSL_PGI_LOENN_PD: "Kildeskatt på lønn — pensjonsgivende inntekt av lønn, bare pensjonsdel",
  KSL_PGI_NAERING: "Kildeskatt på lønn — pensjonsgivende inntekt av næring",
  KSL_PGI_NAERING_FFF:
    "Kildeskatt på lønn — pensjonsgivende inntekt av næring fra fiske, fangst eller familiebarnehage",

  SVA_PGI_LOENN: "Svalbard — pensjonsgivende inntekt av lønn",
  SVA_PGI_LOENN_PD: "Svalbard — pensjonsgivende inntekt av lønn, bare pensjonsdel",
  SVA_PGI_NAERING: "Svalbard — pensjonsgivende inntekt av næring",
  SVA_PGI_NAERING_FFF: "Svalbard — pensjonsgivende inntekt av næring fra fiske, fangst eller familiebarnehage",
};

export function beskrivelseForInntektType(kode: string | null | undefined, dekodeFraApi?: string | null): string {
  if (kode && INNTEKT_TYPE_BESKRIVELSE[kode]) return INNTEKT_TYPE_BESKRIVELSE[kode];
  if (dekodeFraApi) return dekodeFraApi;
  return "Ukjent inntektstype";
}
