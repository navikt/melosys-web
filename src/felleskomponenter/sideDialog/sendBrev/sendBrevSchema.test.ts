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

function expectInntektsopplysningerErrors(err: ValidationError | null) {
  expect(err).toBeTruthy();
  const feltErrors = extractFeltErrors(err);
  expect(feltErrors).toMatchObject({
    FRITEKST: { valg: { melding: "Du må velge minst én av standardtekst eller fritekst" } },
  });

  const forventedeMeldinger = ["Du må velge minst én av standardtekst eller fritekst"];
  const summary = buildValidationSummary(feltErrors);
  forventedeMeldinger.forEach((m) => expect(summary).toContain(m));
  expect(summary.length).toBe(forventedeMeldinger.length);
}

function expectMangelbrevBrukerErrors(err: ValidationError | null) {
  expect(err).toBeTruthy();
  const feltErrors = extractFeltErrors(err);
  expect(unwrapMelding(feltErrors?.INNLEDNING_FRITEKST?.feltVerdi)).toBe(
    "Du må skrive inn innledningstekst i fritekstfeltet",
  );
  expect(unwrapMelding(feltErrors?.MANGLER_FRITEKST?.feltVerdi)).toBe("Du må skrive inn i hva mottaker skal sende inn");
  expect(Object.keys(feltErrors as ErrorsMap).sort()).toEqual(["INNLEDNING_FRITEKST", "MANGLER_FRITEKST"].sort());

  const forventedeMeldinger = [
    "Du må skrive inn innledningstekst i fritekstfeltet",
    "Du må skrive inn i hva mottaker skal sende inn",
  ];
  const summary = buildValidationSummary(feltErrors);
  forventedeMeldinger.forEach((m) => expect(summary).toContain(m));
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

describe("alle kombinasjoner av mottaker og brevmal – korrekte feltfeil og de matcher oppsummering", () => {
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
      { kode: "STANDARDTEKST_INNTEKTSOPPLYSNINGER", paakrevd: false },
    ],
  } as any;

  const mangelbrevBrev = {
    felter: [
      { kode: "INNLEDNING_FRITEKST", paakrevd: true, valg: { valgAlternativer: [{ kode: "X", visFelt: true }] } },
      { kode: "MANGLER_FRITEKST", paakrevd: true },
    ],
  } as any;

  it("VIRKSOMHET + GENERELT_FRITEKSTBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    let values: Partial<SendBrevFormValues> = {
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

    // 0) Initial feil
    let err = await validate(values);
    expect(err).toBeTruthy();
    let feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");
    expect(feltErrors?.DISTRIBUSJONSTYPE?.valg?.melding).toBe("Du må velge type brev");
    expect(feltErrors).toBeDefined();
    const keys0 = Object.keys(feltErrors as Record<string, unknown>);
    expect(keys0.every((k) => new Set(["BREV_TITTEL", "DISTRIBUSJONSTYPE", "FRITEKST"]).has(k))).toBe(true);

    // 1) Fyll DISTRIBUSJONSTYPE
    values = { ...values, felt: { ...values.felt, DISTRIBUSJONSTYPE: { valg: "DIGITAL" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBeUndefined();
    // BREV_TITTEL-feilen skal fortsatt være der
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");

    // 2) Fyll BREV_TITTEL
    values = {
      ...values,
      felt: { ...values.felt, BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "En tittel" } },
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL).toBeUndefined();
    // Ikke krev FRITEKST-feil eksplisitt her, den kan være undertrykt tidligere

    // 3) Fyll FRITEKST -> forvent success
    values = { ...values, felt: { ...values.felt, FRITEKST: { feltVerdi: "Innhold" } } };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("ARBEIDSGIVER + GENERELT_FRITEKSTBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    let values: Partial<SendBrevFormValues> = {
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

    // 0) Initial feil
    let err = await validate(values);
    expect(err).toBeTruthy();
    let feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");
    expect(feltErrors?.DISTRIBUSJONSTYPE?.valg?.melding).toBe("Du må velge type brev");

    // 1) Fyll DISTRIBUSJONSTYPE
    values = { ...values, felt: { ...values.felt, DISTRIBUSJONSTYPE: { valg: "POST" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBeUndefined();
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");

    // 2) Fyll BREV_TITTEL
    values = {
      ...values,
      felt: { ...values.felt, BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "Tittel" } },
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL).toBeUndefined();

    // 3) Fyll FRITEKST -> forvent success
    values = { ...values, felt: { ...values.felt, FRITEKST: { feltVerdi: "Tekst" } } };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("ANNEN_ORGANISASJON + GENERELT_FRITEKSTBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    let values: Partial<SendBrevFormValues> = {
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

    // 0) Initial feil
    let err = await validate(values);
    expect(err).toBeTruthy();
    let feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");
    expect(feltErrors?.DISTRIBUSJONSTYPE?.valg?.melding).toBe("Du må velge type brev");

    // 1) Fyll DISTRIBUSJONSTYPE
    values = { ...values, felt: { ...values.felt, DISTRIBUSJONSTYPE: { valg: "DIGITAL" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.DISTRIBUSJONSTYPE?.valg)).toBeUndefined();
    expect(feltErrors?.BREV_TITTEL?.feltVerdi?.melding).toBe("Du må skrive inn overskrift til brevet");

    // 2) Fyll BREV_TITTEL
    values = {
      ...values,
      felt: { ...values.felt, BREV_TITTEL: { valg: "FRITEKST_BRUKER_OG_VIRKSOMHET", feltVerdi: "Tittel" } },
    };
    err = await validate(values);
    expect(err).toBeTruthy();
    feltErrors = extractFeltErrors(err);
    expect(feltErrors?.BREV_TITTEL).toBeUndefined();

    // 3) Fyll FRITEKST -> forvent success
    values = { ...values, felt: { ...values.felt, FRITEKST: { feltVerdi: "Tekst" } } };
    err = await validate(values);
    expect(err).toBeNull();
  });

  // INNHENTING_AV_INNTEKTSOPPLYSNINGER
  it("VIRKSOMHET + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    // Start: ingen av de to (STANDARDTEKST_INNTEKTSOPPLYSNINGER/FRITEKST) er valgt
    let values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: { rolle: "VIRKSOMHET" } as any,
      arbeidsgiver: "123456789",
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    // 0) Forvent samlet feil: "Du må velge minst én av standardtekst eller fritekst"
    let err = await validate(values);
    expectInntektsopplysningerErrors(err);

    // 1) Velg FRITEKST -> nå kreves også fritekstinnhold
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feltErrors = extractFeltErrors(err);
    // Når fritekst er valgt må feltverdi settes
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");

    // 2) Fyll fritekstinnhold -> forvent success
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST", feltVerdi: "Tekst" } } };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("ARBEIDSGIVER + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    let values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("ARBEIDSGIVER"),
      arbeidsgiver: "987654321",
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    // 0) Initial samlet feil (ingenting valgt)
    let err = await validate(values);
    expectInntektsopplysningerErrors(err);

    // 1) Velg FRITEKST -> krever fritekstinnhold
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");

    // 2) Fyll fritekstinnhold -> success
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST", feltVerdi: "Tekst" } } };
    err = await validate(values);
    expect(err).toBeNull();
  });

  it("ANNEN_ORGANISASJON + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    let values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("ANNEN_ORGANISASJON"),
      organisasjonsnummer: "974760673",
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    // 0) Initial samlet feil (ingenting valgt)
    let err = await validate(values);
    expectInntektsopplysningerErrors(err);

    // 1) Velg FRITEKST -> krever fritekstinnhold
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");

    // 2) Fyll fritekstinnhold -> success
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST", feltVerdi: "Tekst" } } };
    err = await validate(values);
    expect(err).toBeNull();
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
      "Du må skrive inn i hva mottaker skal sende inn",
    );
    const summary = buildValidationSummary(feilEtterFørsteUtfylling);
    expect(summary).toContain("Du må skrive inn i hva mottaker skal sende inn");

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

  it("ARBEIDSGIVER + MANGELBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    const err = await validate({
      type: "MANGELBREV_BRUKER",
      valgtMottaker: { rolle: "ARBEIDSGIVER" } as any,
      arbeidsgiver: "987654321",
      valgtBrev: mangelbrevBrev,
      felt: {
        INNLEDNING_FRITEKST: { valg: "X", feltVerdi: "" },
        MANGLER_FRITEKST: { feltVerdi: "" },
      } as any,
    } as SendBrevFormValues);

    expectMangelbrevBrukerErrors(err);
  });

  it("ANNEN_ORGANISASJON + MANGELBREV_BRUKER -> riktige feltfeil og oppsummering", async () => {
    const err = await validate({
      type: "MANGELBREV_BRUKER",
      valgtMottaker: { rolle: "ANNEN_ORGANISASJON" } as any,
      organisasjonsnummer: "974760673",
      valgtBrev: mangelbrevBrev,
      felt: {
        INNLEDNING_FRITEKST: { valg: "X", feltVerdi: "" },
        MANGLER_FRITEKST: { feltVerdi: "" },
      } as any,
    } as SendBrevFormValues);

    expectMangelbrevBrukerErrors(err);
  });

  it("INNHENTING_AV_INNTEKTSOPPLYSNINGER -> minst én av standardtekst eller fritekst", async () => {
    const err = await validate({
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("BRUKER"),
      valgtBrev: makeBrev("INNHENTING_AV_INNTEKTSOPPLYSNINGER", [
        {
          kode: "FRITEKST",
          paakrevd: false,
          valg: { valgAlternativer: [{ kode: "FRITEKST", beskrivelse: "", visFelt: true }] },
        } as Api.DokumenterV2.Felt,
        { kode: "STANDARDTEKST_INNTEKTSOPPLYSNINGER", paakrevd: false } as Api.DokumenterV2.Felt,
      ]),
      felt: {} as NonNullable<SendBrevFormValues["felt"]>, // Ingen av de to er valgt
    });

    expectInntektsopplysningerErrors(err);
  });

  it("BRUKER + INNHENTING_AV_INNTEKTSOPPLYSNINGER -> riktige feltfeil og oppsummering", async () => {
    let values: Partial<SendBrevFormValues> = {
      type: "INNHENTING_AV_INNTEKTSOPPLYSNINGER",
      valgtMottaker: makeMottaker("BRUKER"),
      valgtBrev: innhentingInntektsopplysningerBrev,
      felt: {},
    };

    // 0) Initial samlet feil (ingenting valgt)
    let err = await validate(values);
    expectInntektsopplysningerErrors(err);

    // 1) Velg FRITEKST -> krever fritekstinnhold
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST" } } };
    err = await validate(values);
    expect(err).toBeTruthy();
    const feltErrors = extractFeltErrors(err);
    expect(unwrapMelding(feltErrors?.FRITEKST?.feltVerdi)).toBe("Du må skrive inn hva mottaker skal sende inn");

    // 2) Fyll fritekstinnhold -> success
    values = { ...values, felt: { ...values.felt, FRITEKST: { valg: "FRITEKST", feltVerdi: "Tekst" } } };
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
