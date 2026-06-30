import { describe, expect, it } from "vitest";
import schema from "./sendBrevSchema";
import type { ErrorsMap, SendBrevFormValues } from "./types";
import type { ValidationError } from "yup";
import * as Api from "../../../services/api";

// Factory-funksjoner for å lage fullverdige, typede testobjekter
const makeMottaker = (rolle: string): Api.DokumenterV2.TilgjengeligMottaker => ({
  uuid: `uuid-${rolle.toLowerCase()}`,
  type: rolle,
  rolle,
  adresser: null,
  feilmelding: undefined,
  trygdemyndighet: null,
});

const makeBrev = (typeKode: string, felter: Api.DokumenterV2.Felt[] | null): Api.DokumenterV2.TilgjengeligBrev => ({
  type: { kode: typeKode, term: null },
  felter,
});

const validate = async (values: Partial<SendBrevFormValues>): Promise<ValidationError | null> => {
  try {
    await schema.validate(values as unknown, { abortEarly: false });
    return null;
  } catch (e: unknown) {
    return e as ValidationError; // Returner hele ValidationError
  }
};

// Hjelpere for å lese og asserte feilbaner
const hasPath = (e: ValidationError | null, path: string): boolean => {
  if (!e) return false;
  const paths = Array.isArray(e.inner) ? e.inner.map((x) => x.path) : e.path ? [e.path] : [];
  return paths.includes(path);
};

const extractFeltErrors = (e: ValidationError | null): ErrorsMap | undefined => {
  if (!e) return undefined;

  // 1) Prøv å finne inner-feilen for path 'felt'
  if (Array.isArray(e.inner) && e.inner.length) {
    const innerNode = e.inner.find((x) => x?.path === "felt");
    if (innerNode?.message) return innerNode.message as unknown as ErrorsMap; // Yup legger objektet i .message
    if ((innerNode as any)?.params?.message) return (innerNode as any).params.message as ErrorsMap; // fallback
  }

  // 2) Fallback: enkelte tilfeller har kun én feil og da er den på toppnoden
  if (e?.path === "felt" && (e as any)?.message) {
    return (e as any).message as ErrorsMap;
  }

  // 3) Ekstra fallback (sjeldent): forsøk params.message på toppnode
  return (e as any)?.params?.message as ErrorsMap | undefined;
};

// Liten helper: trekk ut tekst enten det er string eller { melding: string }
const unwrapMelding = (v: string | { melding: string } | undefined): string | undefined =>
  typeof v === "string" ? v : typeof v === "object" && v ? v.melding : undefined;

function expectMangelbrevBrukerErrors(err: ValidationError | null) {
  expect(err).toBeTruthy();
  const feltErrors = extractFeltErrors(err);

  const innledningFritekstFeltVerdi = unwrapMelding(feltErrors?.INNLEDNING_FRITEKST?.feltVerdi);
  const innledningFritekstValg = unwrapMelding(feltErrors?.INNLEDNING_FRITEKST?.valg);
  const manglerFritekstMsg = unwrapMelding(feltErrors?.MANGLER_FRITEKST?.feltVerdi);

  // Aksepter begge schema-varianter:
  // - feltVerdi-feil for manglende innledningstekst
  // - eller valg-feil dersom valg må gjøres først
  const innledningOK =
    innledningFritekstFeltVerdi === "Du må skrive inn innledningstekst i fritekstfeltet" ||
    innledningFritekstValg === "Du må velge minst én av standardtekst eller fritekst";
  expect(innledningOK).toBe(true);

  expect(manglerFritekstMsg).toBe("Du må skrive inn hva mottaker skal sende inn");

  // Nøklene skal fortsatt være de samme
  expect(Object.keys(feltErrors as ErrorsMap).sort()).toEqual(["INNLEDNING_FRITEKST", "MANGLER_FRITEKST"].sort());

  // Oppsummering: må inneholde melding for MANGLER_FRITEKST og minst én av de to mulige for INNLEDNING_FRITEKST
  const summary = buildValidationSummary(feltErrors);
  expect(summary).toContain("Du må skrive inn hva mottaker skal sende inn");
  expect(
    summary.includes("Du må skrive inn innledningstekst i fritekstfeltet") ||
      summary.includes("Du må velge minst én av standardtekst eller fritekst"),
  ).toBe(true);
}

describe("sendBrevSchema - felles krav for alle brevmaler", () => {
  it("krever mottaker (valgtMottaker) – fyll ett og ett felt til success", async () => {
    // Start: mangler valgtMottaker
    let values: Partial<SendBrevFormValues> = {
      type: "NOE",
      valgtMottaker: undefined,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
      valgtBrev: makeBrev("TEST", []),
    };
    let err = await validate(values);
    expect(err).toBeTruthy();
    expect(hasPath(err, "valgtMottaker")).toBe(true);

    // Fyll inn valgtMottaker -> forvent success (ingen andre felt kreves i dette caset)
    values = {
      ...values,
      valgtMottaker: makeMottaker("BRUKER"),
    };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("krever brevmal (type) – fyll ett og ett felt til success", async () => {
    // Start: mangler både arbeidsgiver (pga rolle ARBEIDSGIVER) og type
    let values: Partial<SendBrevFormValues> = {
      valgtMottaker: makeMottaker("ARBEIDSGIVER"),
      type: undefined,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
      valgtBrev: makeBrev("TEST", []),
    };
    let err = await validate(values);
    expect(err).toBeTruthy();
    expect(hasPath(err, "type")).toBe(true);
    expect(hasPath(err, "arbeidsgiver")).toBe(true);

    // 1) Fyll arbeidsgiver -> kun type-feil skal stå igjen
    values = { ...values, arbeidsgiver: "987654321" };
    err = await validate(values);
    expect(err).toBeTruthy();
    expect(hasPath(err, "arbeidsgiver")).toBe(false);
    expect(hasPath(err, "type")).toBe(true);

    // 2) Fyll type -> forvent success
    values = { ...values, type: "NOE" };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("krever arbeidsgiver for mottakerrolle ARBEIDSGIVER – fyll til success", async () => {
    // Start: mangler arbeidsgiver
    let values: Partial<SendBrevFormValues> = {
      type: "NOE",
      valgtMottaker: makeMottaker("ARBEIDSGIVER"),
      arbeidsgiver: undefined,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
      valgtBrev: makeBrev("TEST", []),
    };
    let err = await validate(values);
    expect(err).toBeTruthy();
    expect(hasPath(err, "arbeidsgiver")).toBe(true);

    // Fyll arbeidsgiver -> forvent success
    values = { ...values, arbeidsgiver: "123456789" };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("krever orgnr for mottakerrolle ANNEN_ORGANISASJON – fyll til success", async () => {
    // Start: mangler orgnr
    let values: Partial<SendBrevFormValues> = {
      type: "NOE",
      valgtMottaker: makeMottaker("ANNEN_ORGANISASJON"),
      organisasjonsnummer: undefined,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
      valgtBrev: makeBrev("TEST", []),
    };
    let err = await validate(values);
    expect(err).toBeTruthy();
    expect(hasPath(err, "organisasjonsnummer")).toBe(true);

    // Fyll orgnr -> forvent success
    values = { ...values, organisasjonsnummer: "974760673" };
    err = await validate(values);
    expect(err).toBeNull();
  });
});

describe("kombinasjoner av mottaker og brevmal – korrekte feltfeil og de matcher oppsummering", () => {
  // Små hjelpere for å redusere duplisering i like testløp
  async function runGenereltFritekstFlow(
    initialValues: Partial<SendBrevFormValues>,
    distribusjonValg: "DIGITAL" | "POST",
  ) {
    // 0) Initial feil
    let err = await validate(initialValues);
    expect(err).toBeTruthy();
    let feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");
    expect(feltErrors?.DISTRIBUSJONSTYPE?.valg?.melding).toBe("Du må velge type brev");

    // 1) Fyll DISTRIBUSJONSTYPE
    let values: Partial<SendBrevFormValues> = {
      ...initialValues,
      felt: {
        ...(initialValues.felt as Record<string, any>),
        DISTRIBUSJONSTYPE: { valg: distribusjonValg },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBeUndefined();
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");

    // 2) Fyll BREV_TITTEL
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "Tittel" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL).toBeUndefined();

    // 3) Fyll FRITEKST -> forvent success
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        FRITEKST: { feltVerdi: "Tekst" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeNull();
  }

  async function runInntektsOpplysningerFlow(initialValues: Partial<SendBrevFormValues>) {
    // 0) Etter MELOSYS-8162/8158 er fritekst kun et valgfritt tillegg. Uten valg er skjemaet gyldig.
    let err = await validate(initialValues);
    expect(err).toBeNull();

    // 1) Velg FRITEKST uten å fylle ut tekst -> krever feltVerdi
    let values: Partial<SendBrevFormValues> = {
      ...initialValues,
      felt: {
        ...(initialValues.felt as Record<string, any>),
        FRITEKST: { valg: "FRITEKST" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");

    // 2) Fyll fritekst -> success
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        FRITEKST: { valg: "FRITEKST", feltVerdi: "Tekst" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeNull();
  }

  // Hver test initialiserer sine egne data for tydelighet

  const genereltFritekstbrevBrev = {
    felter: [
      {
        kode: "BREV_TITTEL",
        paakrevd: true,
        valg: {
          valgAlternativer: [{ kode: "FRITEKST_BRUKER_OG_VIRKSOMHET", beskrivelse: "Fritekstittel", visFelt: true }],
        },
      },
      { kode: "FRITEKST", paakrevd: true },
      {
        kode: "DISTRIBUSJONSTYPE",
        paakrevd: true,
        valg: {
          valgAlternativer: [
            { kode: "DIGITAL", beskrivelse: "Digital", visFelt: true },
            { kode: "POST", beskrivelse: "Post", visFelt: true },
          ],
        },
      },
    ],
  } as any;

  const innhentingInntektsopplysningerBrev = {
    felter: [
      {
        kode: "FRITEKST",
        paakrevd: false,
        valg: { valgAlternativer: [{ kode: "FRITEKST", beskrivelse: "Fritekst", visFelt: true }] },
      },
    ],
  } as any;

  it("VIRKSOMHET + GENERELT_FRITEKSTBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "GENERELT_FRITEKSTBREV_BRUKER",
      valgtMottaker: { rolle: "VIRKSOMHET" } as any,
      arbeidsgiver: "123456789",
      valgtBrev: genereltFritekstbrevBrev,
      felt: {
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "" },
        FRITEKST: { feltVerdi: "" },
        DISTRIBUSJONSTYPE: {},
      } as any,
    };

    await runGenereltFritekstFlow(values, "DIGITAL");
  });

  it("ARBEIDSGIVER + GENERELT_FRITEKSTBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "GENERELT_FRITEKSTBREV_BRUKER",
      valgtMottaker: { rolle: "ARBEIDSGIVER" } as any,
      arbeidsgiver: "987654321",
      valgtBrev: genereltFritekstbrevBrev,
      felt: {
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "" },
        FRITEKST: { feltVerdi: "" },
        DISTRIBUSJONSTYPE: {},
      } as any,
    };

    await runGenereltFritekstFlow(values, "POST");
  });

  it("ANNEN_ORGANISASJON + GENERELT_FRITEKSTBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "GENERELT_FRITEKSTBREV_BRUKER",
      valgtMottaker: { rolle: "ANNEN_ORGANISASJON" } as any,
      organisasjonsnummer: "974760673",
      valgtBrev: genereltFritekstbrevBrev,
      felt: {
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "" },
        FRITEKST: { feltVerdi: "" },
        DISTRIBUSJONSTYPE: {},
      } as any,
    };

    await runGenereltFritekstFlow(values, "DIGITAL");
  });

  // INNHENTING_AV_INNTEKTSOPPLYSNINGER
  it("VIRKSOMHET + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: { rolle: "VIRKSOMHET" } as any,
      arbeidsgiver: "123456789",
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    await runInntektsOpplysningerFlow(values);
  });

  it("ARBEIDSGIVER + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("ARBEIDSGIVER"),
      arbeidsgiver: "987654321",
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    await runInntektsOpplysningerFlow(values);
  });

  it("ANNEN_ORGANISASJON + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("ANNEN_ORGANISASJON"),
      organisasjonsnummer: "974760673",
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    await runInntektsOpplysningerFlow(values);
  });

  // MANGELBREV_BRUKER
  it("VIRKSOMHET + MANGELBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    // Start med manglende brevfelter, fyll ett og ett felt og bekreft at feil forsvinner
    const valgtBrev = makeBrev("MANGELBREV_BRUKER", [
      { kode: "INNLEDNING_FRITEKST", paakrevd: true, valg: null } as any,
      { kode: "MANGLER_FRITEKST", paakrevd: true, valg: null } as any,
    ]);

    // Begynn med VIRKSOMHET (krever arbeidsgiver) og ingen brev-felt utfylt
    let values: Partial<SendBrevFormValues> = {
      type: "MANGELBREV_BRUKER",
      valgtMottaker: makeMottaker("VIRKSOMHET"),
      arbeidsgiver: "999999999",
      valgtBrev,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
    };

    // 1) Forvent begge felt-feil
    let err = await validate(values);
    expectMangelbrevBrukerErrors(err);

    // 2) Fyll inn INNLEDNING_FRITEKST -> kun MANGLER_FRITEKST skal gjenstå
    values = {
      ...values,
      felt: {
        INNLEDNING_FRITEKST: { feltVerdi: "Innledningstekst" } as any,
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feilEtterFørsteUtfylling = extractFeltErrors(err);
    expect(unwrapMelding(feilEtterFørsteUtfylling?.INNLEDNING_FRITEKST?.feltVerdi)).toBeUndefined();
    expect(unwrapMelding(feilEtterFørsteUtfylling?.MANGLER_FRITEKST?.feltVerdi)).toBe(
      "Du må skrive inn hva mottaker skal sende inn",
    );
    const summary = buildValidationSummary(feilEtterFørsteUtfylling);
    expect(summary).toContain("Du må skrive inn hva mottaker skal sende inn");

    // Hvis schema fortsatt krever valg for INNLEDNING_FRITEKST, sett et lovlig valg før siste validering
    const innledningValgMangler =
      unwrapMelding(feilEtterFørsteUtfylling?.INNLEDNING_FRITEKST?.valg) ===
      "Du må velge minst én av standardtekst eller fritekst";
    const innledningValgKode =
      (valgtBrev.felter?.find((f: any) => f.kode === "INNLEDNING_FRITEKST")?.valg?.valgAlternativer?.[0]?.kode as
        | string
        | undefined) || "FRITEKST";

    // 3) Fyll inn MANGLER_FRITEKST -> ingen feil igjen
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        INNLEDNING_FRITEKST: {
          ...(values.felt as any)?.INNLEDNING_FRITEKST,
          ...(innledningValgMangler ? { valg: innledningValgKode } : {}),
        },
        MANGLER_FRITEKST: { feltVerdi: "Send inn dokumentasjon" } as any,
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("ARBEIDSGIVER + MANGELBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    // Start med manglende brevfelter, fyll ett og ett felt og bekreft at feil forsvinner
    const valgtBrev = makeBrev("MANGELBREV_BRUKER", [
      {
        kode: "INNLEDNING_FRITEKST",
        paakrevd: true,
        valg: { valgAlternativer: [{ kode: "X", visFelt: true }] },
      } as any,
      { kode: "MANGLER_FRITEKST", paakrevd: true, valg: null } as any,
    ]);

    let values: Partial<SendBrevFormValues> = {
      type: "MANGELBREV_BRUKER",
      valgtMottaker: makeMottaker("ARBEIDSGIVER"),
      arbeidsgiver: "987654321",
      valgtBrev,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
    };

    // 1) Forvent begge felt-feil
    let err = await validate(values);
    expectMangelbrevBrukerErrors(err);

    // 2) Fyll inn INNLEDNING_FRITEKST -> kun MANGLER_FRITEKST skal gjenstå
    values = {
      ...values,
      felt: {
        INNLEDNING_FRITEKST: { valg: "X", feltVerdi: "Innledningstekst" } as any,
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feilEtter = extractFeltErrors(err);
    expect(unwrapMelding(feilEtter?.INNLEDNING_FRITEKST?.feltVerdi)).toBeUndefined();
    expect(unwrapMelding(feilEtter?.MANGLER_FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");
    const summary = buildValidationSummary(feilEtter);
    expect(summary).toContain("Du må skrive inn hva mottaker skal sende inn");

    // 3) Fyll inn MANGLER_FRITEKST -> ingen feil igjen
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        MANGLER_FRITEKST: { feltVerdi: "Send inn dokumentasjon" } as any,
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("ANNEN_ORGANISASJON + MANGELBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    const valgtBrev = makeBrev("MANGELBREV_BRUKER", [
      { kode: "INNLEDNING_FRITEKST", paakrevd: true, valg: null } as any,
      { kode: "MANGLER_FRITEKST", paakrevd: true, valg: null } as any,
    ]);

    let values: Partial<SendBrevFormValues> = {
      type: "MANGELBREV_BRUKER",
      valgtMottaker: makeMottaker("ANNEN_ORGANISASJON"),
      organisasjonsnummer: "974760673",
      valgtBrev,
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
    };

    // 1) Forvent begge felt-feil
    let err = await validate(values);
    expectMangelbrevBrukerErrors(err);

    // 2) Fyll inn INNLEDNING_FRITEKST -> kun MANGLER_FRITEKST skal gjenstå
    values = {
      ...values,
      felt: {
        INNLEDNING_FRITEKST: { feltVerdi: "Innledningstekst" } as any,
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feilEtter = extractFeltErrors(err);
    expect(unwrapMelding(feilEtter?.INNLEDNING_FRITEKST?.feltVerdi)).toBeUndefined();
    expect(unwrapMelding(feilEtter?.MANGLER_FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");
    const summary = buildValidationSummary(feilEtter);
    expect(summary).toContain("Du må skrive inn hva mottaker skal sende inn");

    const innledningValgMangler =
      unwrapMelding(feilEtter?.INNLEDNING_FRITEKST?.valg) === "Du må velge minst én av standardtekst eller fritekst";
    const innledningValgKode =
      (valgtBrev.felter?.find((f: any) => f.kode === "INNLEDNING_FRITEKST")?.valg?.valgAlternativer?.[0]?.kode as
        | string
        | undefined) || "FRITEKST";

    // 3) Fyll inn MANGLER_FRITEKST -> ingen feil igjen
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        INNLEDNING_FRITEKST: {
          ...(values.felt as any)?.INNLEDNING_FRITEKST,
          ...(innledningValgMangler ? { valg: innledningValgKode } : {}),
        },
        MANGLER_FRITEKST: { feltVerdi: "Send inn dokumentasjon" } as any,
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("BRUKER + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    const values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("BRUKER"),
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    await runInntektsOpplysningerFlow(values);
  });

  it("UTENLANDSK_TRYGDEMYNDIGHET + UTENLANDSK_TRYGDEMYNDIGHET_FRITEKSTBREV – validerer feil først, fyller felt ett og ett til success", async () => {
    const felter: Api.DokumenterV2.Felt[] = [
      {
        kode: "UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER",
        beskrivelse: "Trygdemyndighet",
        feltType: Api.DokumenterV2.FeltType.TEKST,
        hjelpetekst: null,
        paakrevd: true,
        tegnBegrensning: null,
        valg: {
          valgType: Api.DokumenterV2.ValgType.SELECT,
          valgAlternativer: [
            { kode: "FO", beskrivelse: "Trygdemyndighetene i Færøyene", visFelt: true },
            { kode: "GL", beskrivelse: "Trygdemyndighetene i Grønland", visFelt: true },
          ],
        },
      },
      {
        kode: "BREV_TITTEL",
        beskrivelse: "Overskrift i brev",
        feltType: Api.DokumenterV2.FeltType.TEKST,
        hjelpetekst: null,
        paakrevd: true,
        tegnBegrensning: 60,
        valg: {
          valgType: Api.DokumenterV2.ValgType.SELECT,
          valgAlternativer: [
            {
              kode: "HENVENDELSE_OM_TRYGDETILHØRLIGHET",
              beskrivelse: "Svar på henvendelse om trygdetilhørlighet",
              visFelt: false,
            },
            { kode: "FRITEKST_BRUKER_OG_VIRKSOMHET", beskrivelse: "Fritekst (maks 60 tegn)", visFelt: true },
          ],
        },
      },
      {
        kode: "FRITEKST",
        beskrivelse: "Hovedtekst til brev",
        feltType: Api.DokumenterV2.FeltType.FRITEKST,
        hjelpetekst: null,
        paakrevd: true,
        tegnBegrensning: null,
        valg: null,
      },
      {
        kode: "DISTRIBUSJONSTYPE",
        beskrivelse: "Type brev",
        feltType: Api.DokumenterV2.FeltType.TEKST,
        hjelpetekst:
          "Type brev må angis slik at bruker får riktig varseltekst om brevet som sendes. Gjelder det et vedtak eller en forespørsel, vil bruker få en påminnelse hvis brevet ikke har blitt lest innen 7 dager.",
        paakrevd: true,
        tegnBegrensning: null,
        valg: {
          valgType: Api.DokumenterV2.ValgType.RADIO,
          valgAlternativer: [
            { kode: "VEDTAK", beskrivelse: "Vedtak", visFelt: false },
            { kode: "VIKTIG", beskrivelse: "Viktig", visFelt: false },
            { kode: "ANNET", beskrivelse: "Annet", visFelt: false },
          ],
        },
      },
    ];

    const start: Partial<SendBrevFormValues> = {
      type: "UTENLANDSK_TRYGDEMYNDIGHET_FRITEKSTBREV",
      valgtMottaker: makeMottaker("UTENLANDSK_TRYGDEMYNDIGHET"),
      valgtBrev: makeBrev("UTENLANDSK_TRYGDEMYNDIGHET_FRITEKSTBREV", felter),
      felt: {} as NonNullable<SendBrevFormValues["felt"]>,
    };

    // 0) Start: ingen felter fylt -> forvent korrekte feil
    let err = await validate(start);
    expect(err).toBeTruthy();
    let feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER?.valg)).toBe("Du må velge trygdemyndighet");
    // For BREV_TITTEL uten valg er det valg-feil (ikke feltVerdi)
    expect(unwrapMelding(feltErrors?.BREV_TITTEL?.valg)).toBe("Du må velge overskrift til brevet");
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hovedtekst til brevet");
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBe("Du må velge type brev");

    // 1) Fyll UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER
    let values: Partial<SendBrevFormValues> = {
      ...start,
      felt: {
        ...(start.felt as Record<string, any>),
        UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER: { valg: "FO" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER?.valg)).toBeUndefined();
    // Andre feil består
    expect(unwrapMelding(feltErrors?.BREV_TITTEL?.valg)).toBe("Du må velge overskrift til brevet");
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hovedtekst til brevet");
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBe("Du må velge type brev");

    // 2) Fyll DISTRIBUSJONSTYPE
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        DISTRIBUSJONSTYPE: { valg: "VIKTIG" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBeUndefined();
    expect(unwrapMelding(feltErrors?.BREV_TITTEL?.valg)).toBe("Du må velge overskrift til brevet");
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hovedtekst til brevet");

    // 3) Velg BREV_TITTEL = fritekst-variant uten å fylle tekst -> forvent feltVerdi-feil
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    feltErrors = extractFeltErrors(err);
    const tittelFeilEtterValg =
      unwrapMelding(feltErrors?.BREV_TITTEL?.feltVerdi) || unwrapMelding(feltErrors?.BREV_TITTEL?.valg);
    expect(tittelFeilEtterValg).toBe("Du må skrive inn overskrift til brevet");
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hovedtekst til brevet");

    // 4) Fyll inn overskrift (feltVerdi)
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "Tittel" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };
    err = await validate(values);
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.BREV_TITTEL?.valg)).toBeUndefined();
    expect(unwrapMelding(feltErrors?.BREV_TITTEL?.feltVerdi)).toBeUndefined();
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hovedtekst til brevet");

    // 5) Fyll FRITEKST
    values = {
      ...values,
      felt: {
        ...(values.felt as Record<string, any>),
        FRITEKST: { feltVerdi: "Dette er en fritekst" },
      } as NonNullable<SendBrevFormValues["felt"]>,
    };

    // 6) Nå skal validering være OK
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("NORSK_MYNDIGHET + GENERELT_FRITEKSTBREV_BRUKER -> krever minst én etat valgt", async () => {
    // Test for Norske myndigheter som mottaker med Fritekstbrev
    const fritekstbrevBrev = {
      felter: [
        {
          kode: "BREV_TITTEL",
          paakrevd: true,
          valg: {
            valgAlternativer: [{ kode: "FRITEKST_BRUKER_OG_VIRKSOMHET", beskrivelse: "Fritekstittel", visFelt: true }],
          },
        },
        { kode: "FRITEKST", paakrevd: true },
        {
          kode: "DISTRIBUSJONSTYPE",
          paakrevd: true,
          valg: {
            valgAlternativer: [
              { kode: "DIGITAL", beskrivelse: "Digital", visFelt: true },
              { kode: "POST", beskrivelse: "Post", visFelt: true },
            ],
          },
        },
      ],
    } as any;

    // Start: Norsk myndighet valgt men ingen etater valgt, samt tomme påkrevde felter
    let values: Partial<SendBrevFormValues> = {
      type: "GENERELT_FRITEKSTBREV_BRUKER",
      valgtMottaker: makeMottaker("NORSK_MYNDIGHET"),
      norskeMyndigheter: [], // Tom array - ingen etater valgt
      valgtBrev: fritekstbrevBrev,
      felt: {
        BREV_TITTEL: {},
        FRITEKST: {},
        DISTRIBUSJONSTYPE: {},
      } as any,
    };

    // Forvent feil på norskeMyndigheter og påkrevde felter
    let err = await validate(values);
    expect(err).toBeTruthy();
    expect(hasPath(err, "norskeMyndigheter")).toBe(true);

    // Sjekk at feilmeldingen er korrekt - feilmeldingen er i første error som objekt
    const norskeMyndighetError = err?.errors?.[0] as any;
    expect(norskeMyndighetError?.melding).toBe("Du må velge minst én etat");

    // Sjekk også at brevfeltene har feil
    const feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL?.valg?.melding).toBe("Du må velge overskrift til brevet");
    expect(feltErrors?.FRITEKST?.feltVerdi?.melding).toBe("Du må skrive inn hovedtekst til brevet");
    expect(feltErrors?.DISTRIBUSJONSTYPE?.valg?.melding).toBe("Du må velge type brev");

    // Fyll norskeMyndigheter og alle påkrevde felter -> forvent success
    values = {
      ...values,
      norskeMyndigheter: ["974760673"],
      felt: {
        BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "Test tittel" },
        FRITEKST: { feltVerdi: "Test innhold" },
        DISTRIBUSJONSTYPE: { valg: "DIGITAL" },
      } as any,
    };
    err = await validate(values);
    expect(err).toBeNull();

    // Test også at det fungerer med undefined norskeMyndigheter når mottaker ikke er NORSK_MYNDIGHET
    values = {
      ...values,
      valgtMottaker: makeMottaker("BRUKER"),
      norskeMyndigheter: undefined,
    };
    err = await validate(values);
    expect(err).toBeNull();
  });
});

function buildValidationSummary(syncErrors: ErrorsMap | undefined): string[] {
  const result: string[] = [];

  const pushMsg = (msg: unknown) => {
    const isMeldingObject = (value: unknown): value is { melding: string } => {
      return typeof value === "object" && value !== null && "melding" in value;
    };

    const m = typeof msg === "string" ? msg : isMeldingObject(msg) ? msg.melding : undefined;
    if (!m) return;
    if (m === "Valideringsfeil") return; // behold eksisterende filtrering
    if (m.startsWith("Fyll ut feltet") || m.startsWith("Fyll ut feltene")) return; // ikke ta sammendragsmeldinger
    result.push(m);
  };

  const traverse = (obj: unknown) => {
    if (obj === null) return;
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    if (typeof obj === "object") {
      const objWithProperties = obj as { melding?: string; _error?: string };
      if (typeof objWithProperties.melding === "string") pushMsg(objWithProperties.melding);
      if (typeof objWithProperties._error === "string") pushMsg(objWithProperties._error);
      Object.values(obj).forEach(traverse);
      return;
    }
    pushMsg(obj);
  };

  if (syncErrors && typeof syncErrors === "object") {
    Object.entries(syncErrors as Record<string, unknown>).forEach(([, feilmelding]) => {
      if (typeof feilmelding === "object" && feilmelding !== null) {
        traverse(feilmelding);
      } else {
        pushMsg(feilmelding);
      }
    });
  }

  const unike = Array.from(new Set(result));
  const harBrevtittelLinje = unike.some(
    (m) => m.toLowerCase().includes("brevtittel") || m.toLowerCase().includes("brev tittel"),
  );
  return unike.filter((m) => !(harBrevtittelLinje && m.trim() === "Fyll inn tittel"));
}
