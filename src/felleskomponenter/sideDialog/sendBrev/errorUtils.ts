/**
 * Sjekker om en feilmelding skal vises basert på skjemaets tilstand.
 *
 * @param field Feltnavnet det er feil på
 * @param formValues Gjeldende skjemaverdier
 * @param mottakerTypeTilstand Objekt med mottaker-spesifikke tilstander
 * @returns boolean som indikerer om feilen skal vises
 */
export function skalViseFeil(
  field: string,
  formValues: any,
  { mottakerErArbeidsgiver, erAnnenOrganisasjon }: { mottakerErArbeidsgiver: boolean; erAnnenOrganisasjon: boolean },
): boolean {
  const requiredSteps = ["mottaker", "valgtMottaker", "type", "valgtBrev"];

  const missingStep = requiredSteps.find((step) => !formValues?.[step]);
  if (missingStep) return field === missingStep;

  return !(
    (field === "arbeidsgiver" && !mottakerErArbeidsgiver) ||
    (field === "organisasjonsnummer" && !erAnnenOrganisasjon)
  );
}

/**
 * Filtrerer relevante feil basert på skjemaets tilstand.
 *
 * @param formErrors Feilmeldinger fra skjemaet
 * @param formValues Gjeldende skjemaverdier
 * @param mottakerTypeTilstand Objekt med mottaker-spesifikke tilstander
 * @returns Array av feilmeldinger filtrert og sortert etter relevans
 */
export function visRelevanteFeil(
  formErrors: Record<string, any>,
  formValues: any,
  mottakerTypeTilstand: { mottakerErArbeidsgiver: boolean; erAnnenOrganisasjon: boolean },
): [string, any][] {
  if (!formErrors || Object.keys(formErrors).length === 0) return [];

  return Object.entries(formErrors).filter(([field]) => skalViseFeil(field, formValues, mottakerTypeTilstand));
}
