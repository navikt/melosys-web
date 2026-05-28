export const INNTEKT_TYPE_BESKRIVELSE: Record<string, string> = {
  INN_LON: "Lønnsinntekt i Norge",
  INN_SEL: "Selvstendig næringsinntekt i Norge",
  INN_JSF: "Inntekt i Norge fra FFF*",

  SJO_LON: "Lønnsinntekt fra sjøfart",
  SJO_SEL: "Selvstendig næringsinntekt fra sjøfart",
  SJO_JSF: "Inntekt fra sjøfart knyttet til JSF*",

  UTE_LON: "Lønnsinntekt fra utlandet",
  UTE_SEL: "Selvstendig næringsinntekt fra utlandet",
  UTE_JSF: "Utenlandsinntekt fra JSF*",

  SVA_LON: "Lønnsinntekt på Svalbard",
  SVA_SEL: "Selvstendig næringsinntekt på Svalbard",
  // SVA_JSF: ikke avklart med produkteier — faller tilbake til API-dekode

  DIP_LON: "Diplomatinntekt (lønn)",
  DIP_SEL: "Diplomatinntekt (selvstendig næring)",
  DIP_JSF: "Diplomatinntekt knyttet til JSF*",

  // Pensjonsdel-koder. Figma viser én rad «Lønnsinntekt (pensjonsdel)»
  // og det er ikke avklart hvilken POPP-kode den representerer.
  // Tar med begge med samme tekst inntil produkteier klargjør.
  FL_PGI_LOENN_PD: "Lønnsinntekt (pensjonsdel)",
  KSL_PGI_LOENN_PD: "Lønnsinntekt (pensjonsdel)",

  KSL_PGI_NAERING: "Næringsinntekt (KSL)",
  KSL_PGI_NAERING_FFF: "Næringsinntekt (FFF, KSL)",

  SVA_PGI_NAERING_FFF: "Næringsinntekt på Svalbard (FFF)",

  PI66: "Inntekt fra 1966 konvensjon",
  PGI_NAV: "Inntekt fastsatt av Nav",
  RED_INT: "Reduksjonsinntekt",
  AI: "Beregnet/forventet inntekt",
  SUM_PI: "Sum pensjonsgivende inntekt",

  // Øvrige PGI-koder (FL_PGI_LOENN, FL_PGI_NAERING, FL_PGI_NAERING_FFF,
  // KSL_PGI_LOENN, SVA_PGI_LOENN, SVA_PGI_LOENN_PD, SVA_PGI_NAERING)
  // er ikke i Figma — faller tilbake til API-dekode.
};

export function beskrivelseForInntektType(kode: string | null | undefined, dekodeFraApi?: string | null): string {
  if (kode && INNTEKT_TYPE_BESKRIVELSE[kode]) return INNTEKT_TYPE_BESKRIVELSE[kode];
  if (dekodeFraApi) return dekodeFraApi;
  return "Ukjent inntektstype";
}
