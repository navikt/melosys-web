import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MKV from "../../../../../melosyskodeverk";
import { hentInformasjonstekst, VurderingPerioder } from "./vurderingPerioder";

const { NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;
const { INNVILGET, AVSLAATT } = MKV.Koder.innvilgelsesResultat;
const { FTRL_2_9_FØRSTE_LEDD_A_HELSE, FTRL_2_9_FØRSTE_LEDD_B_PENSJON, FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON } =
  MKV.Koder.trygdedekninger;
const BESTEMMELSE = "FTRL_KAP2_2_8_FØRSTE_LEDD_A";

interface Periode {
  id: number;
  fomDato: string;
  tomDato: string;
  trygdedekning: string;
  innvilgelsesResultat: string;
  bestemmelse: string;
}

interface Kall {
  type: "OPPRETT" | "OPPDATER" | "SLETT";
  periodeId?: number;
  request?: Omit<Periode, "id">;
}

// Enkel falsk melosys-api: lagrer perioder i minnet og svarer etter en forsinkelse (falske timere).
const server = {
  perioder: new Map<number, Periode>(),
  kall: [] as Kall[],
  pågående: 0,
  maksSamtidige: 0,
  nesteId: 5000,
  forsinkelse: (() => 0) as (kallNr: number, action: Kall) => number,
};

const tilstand = {
  lagrede: [] as Periode[],
  soknadsperiode: { fom: "2026-01-01", tom: "2026-12-31" } as { fom: string; tom?: string },
  ukjentSluttdato: false,
};

const svarEtter = <T,>(ms: number, lag: () => T): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(lag()), ms);
  });

const dispatchMock = vi.fn((action: any): Promise<any> => {
  if (action.type === "OPPDATER" || action.type === "OPPRETT") {
    const kallNr = server.kall.filter((k) => k.type !== "SLETT").length;
    server.kall.push(action);
    server.pågående += 1;
    server.maksSamtidige = Math.max(server.maksSamtidige, server.pågående);
    return svarEtter(server.forsinkelse(kallNr, action), () => {
      server.pågående -= 1;
      const id = action.type === "OPPRETT" ? (server.nesteId += 1) : action.periodeId;
      const periode = { ...action.request, id };
      server.perioder.set(id, periode);
      return { type: "medlemskapsperioder/OK", data: periode };
    });
  }
  if (action.type === "SLETT") {
    server.kall.push(action);
    return svarEtter(server.forsinkelse(-1, action), () => {
      server.perioder.delete(action.periodeId);
      return { type: "medlemskapsperioder/OK_SLETT", data: { id: action.periodeId } };
    });
  }
  return Promise.resolve({ type: "OK" });
});

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return { ...actual, useSelector: (selector: any) => selector() };
});

vi.mock("../../../../../hooks", () => ({ useDispatch: () => dispatchMock }));

vi.mock("../../../../../ducks/behandlinger", () => ({
  behandlingerSelectors: {
    BehandlingIDSelector: () => 1,
    BehandlingstypeKodeSelector: () => "FØRSTEGANG",
    BehandlingstemaKodeSelector: () => "YRKESAKTIV",
  },
}));

vi.mock("../../../../../ducks/medlemskapsperioder", () => ({
  medlemskapsperioderOperations: {
    opprettMedlemskapsperiode: (_behandlingID: number, request: any) => ({ type: "OPPRETT", request }),
    oppdaterMedlemskapsperiode: (_behandlingID: number, periodeId: number, request: any) => ({
      type: "OPPDATER",
      periodeId,
      request,
    }),
    slettMedlemskapsperiode: (_behandlingID: number, periodeId: number) => ({ type: "SLETT", periodeId }),
    hentMedlemskapsperioder: () => ({ type: "HENT" }),
  },
  medlemskapsperioderSelectors: {
    AlleMedlemskapsperioderSelector: () => tilstand.lagrede,
    BestemmelseSelector: () => BESTEMMELSE,
  },
  medlemskapsperioderTypes: { FEILET: "medlemskapsperioder/FEILET" },
}));

vi.mock("../../../../../ducks/mottatteOpplysninger", () => ({
  mottatteOpplysningerSelectors: {
    PeriodeSelector: () => tilstand.soknadsperiode,
    SoknadslandkoderSelector: () => ["US"],
  },
}));

vi.mock("../../../../../ducks/redigerbart", () => ({ redigerbartSelectors: { RedigerbartSelector: () => true } }));

vi.mock("../../../../../ducks/oppsummertfakta", () => ({
  oppsummertfaktaOperations: {
    lagreUkjentSluttdatoMedlemskapsperiode: (_behandlingID: number, verdi: boolean) => ({
      type: "LAGRE_UKJENT_SLUTTDATO",
      verdi,
    }),
  },
  oppsummertfaktaSelectors: {
    IkkeYrkesaktivOppholdSelector: () => undefined,
    ArbeidssituasjonSelector: () => undefined,
    UkjentSluttdatoMedlemskapsperiodeSelector: () => tilstand.ukjentSluttdato,
    ErDelvisOpphørValgtSelector: () => false,
  },
}));

vi.mock("../../../../../featuretoggle", () => ({ useFeatureToggle: () => false }));
vi.mock("../../../../../featuretoggle/useFeatureToggle", () => ({ default: () => false }));

vi.mock("../../../../../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../../services/api")>();
  return {
    ...actual,
    LovligeKombinasjoner: {
      ...actual.LovligeKombinasjoner,
      hentTrygdedekninger: () =>
        Promise.resolve([
          "FTRL_2_9_FØRSTE_LEDD_A_HELSE",
          "FTRL_2_9_FØRSTE_LEDD_B_PENSJON",
          "FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON",
        ]),
    },
    Ftrl: {
      ...actual.Ftrl,
      hentGyldigeInnvilgelsesresultat: () => Promise.resolve(["INNVILGET", "AVSLAATT"]),
    },
  };
});

// Forslaget ved frivillig medlemskap med helse- og pensjonsdel (samme oppsett som probene i analysen).
// Avslåtte perioder sorteres først ved lik fomDato, så radene står i denne rekkefølgen.
const PENSJON_AVSLÅTT: Periode = {
  id: 1,
  fomDato: "2026-01-01",
  tomDato: "2026-09-23",
  trygdedekning: FTRL_2_9_FØRSTE_LEDD_B_PENSJON,
  innvilgelsesResultat: AVSLAATT,
  bestemmelse: BESTEMMELSE,
};
const HELSE_INNVILGET: Periode = {
  id: 2,
  fomDato: "2026-01-01",
  tomDato: "2026-09-23",
  trygdedekning: FTRL_2_9_FØRSTE_LEDD_A_HELSE,
  innvilgelsesResultat: INNVILGET,
  bestemmelse: BESTEMMELSE,
};
const HELSE_PENSJON_INNVILGET: Periode = {
  id: 3,
  fomDato: "2026-09-24",
  tomDato: "2026-12-31",
  trygdedekning: FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON,
  innvilgelsesResultat: INNVILGET,
  bestemmelse: BESTEMMELSE,
};

const vent = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const kjørFerdig = () =>
  act(async () => {
    await vi.runAllTimersAsync();
  });

const resultat = (rad: number) =>
  screen.getByRole("combobox", { name: `Resultat periode ${rad}` }) as HTMLSelectElement;
const dekning = (rad: number) =>
  screen.getByRole("combobox", { name: `Trygdedekning periode ${rad}` }) as HTMLSelectElement;
const rad = (nr: number) => ({ trygdedekning: dekning(nr).value, innvilgelsesResultat: resultat(nr).value });
const velgResultat = (radNr: number, verdi: string) =>
  act(async () => {
    fireEvent.change(resultat(radNr), { target: { value: verdi } });
  });
const oppdateringerFor = (periodeId: number) =>
  server.kall.filter((k) => k.type === "OPPDATER" && k.periodeId === periodeId);

const leggTilUtfyltRad = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Legg til periode" }));
  });
  const [fom, tom] = screen.getAllByRole("textbox").slice(6);
  await act(async () => {
    fireEvent.change(fom, { target: { value: "24.09.2026" } });
    fireEvent.change(tom, { target: { value: "31.12.2026" } });
    fireEvent.change(dekning(4), { target: { value: FTRL_2_9_FØRSTE_LEDD_B_PENSJON } });
  });
  await velgResultat(4, AVSLAATT);
};
const slettRad = (radNr: number) =>
  act(async () => {
    fireEvent.click(screen.getAllByRole("button", { name: "Slett periode" })[radNr - 1]);
  });

// Rendrer steget og venter til lagringen som starter når steget blir gyldig, er ferdig.
const renderSteg = async () => {
  render(<VurderingPerioder bekreft={vi.fn()} tilbake={vi.fn()} aktivtSteg oppdaterStatus={vi.fn()} />);
  await kjørFerdig();
  server.kall = [];
  server.maksSamtidige = 0;
};

describe("VurderingPerioder autolagring", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dispatchMock.mockClear();
    tilstand.lagrede = [PENSJON_AVSLÅTT, HELSE_INNVILGET, HELSE_PENSJON_INNVILGET];
    tilstand.soknadsperiode = { fom: "2026-01-01", tom: "2026-12-31" };
    tilstand.ukjentSluttdato = false;
    server.perioder = new Map(tilstand.lagrede.map((p) => [p.id, { ...p }]));
    server.kall = [];
    server.pågående = 0;
    server.maksSamtidige = 0;
    server.nesteId = 5000;
    server.forsinkelse = () => 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lagrer forslaget og viser hver periode i sin egen rad når steget blir gyldig", async () => {
    render(<VurderingPerioder bekreft={vi.fn()} tilbake={vi.fn()} aktivtSteg oppdaterStatus={vi.fn()} />);
    await kjørFerdig();

    expect(oppdateringerFor(1)).toHaveLength(1);
    expect(oppdateringerFor(2)).toHaveLength(1);
    expect(oppdateringerFor(3)).toHaveLength(1);
    expect(rad(1)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_B_PENSJON, innvilgelsesResultat: AVSLAATT });
    expect(rad(2)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_A_HELSE, innvilgelsesResultat: INNVILGET });
    expect(rad(3)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON, innvilgelsesResultat: INNVILGET });
  });

  // Feil 1: svaret for hver periode ble skrevet til raden som ble endret, ikke til periodens egen rad.
  it("endrer ikke innholdet i andre rader når én rad endres på et gyldig steg", async () => {
    await renderSteg();

    await velgResultat(2, AVSLAATT);
    await kjørFerdig();

    expect(rad(1)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_B_PENSJON, innvilgelsesResultat: AVSLAATT });
    expect(rad(2)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_A_HELSE, innvilgelsesResultat: AVSLAATT });
    expect(rad(3)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON, innvilgelsesResultat: INNVILGET });
    expect(server.perioder.get(2)?.innvilgelsesResultat).toBe(AVSLAATT);
  });

  it("lagrer ikke når endringen gjør steget ugyldig", async () => {
    await renderSteg();

    await velgResultat(1, INNVILGET); // to innvilgede perioder for 01.01–23.09 overlapper
    await kjørFerdig();

    expect(server.kall).toHaveLength(0);
    expect(screen.getByText("Innvilgede perioder overlapper.")).toBeInTheDocument();
  });

  // Feil 2: lagringen sendte verdiene fra useFieldArray-fields, som ikke oppdateres når et felt endres.
  it("lagrer begge endringene når to rader endres innen 500 ms", async () => {
    await renderSteg();

    await velgResultat(2, AVSLAATT);
    await vent(200);
    await velgResultat(1, INNVILGET);
    await kjørFerdig();

    expect(oppdateringerFor(2).at(-1)?.request?.innvilgelsesResultat).toBe(AVSLAATT);
    expect(server.perioder.get(1)?.innvilgelsesResultat).toBe(INNVILGET);
    expect(server.perioder.get(2)?.innvilgelsesResultat).toBe(AVSLAATT);
    expect(rad(1).innvilgelsesResultat).toBe(INNVILGET);
    expect(rad(2).innvilgelsesResultat).toBe(AVSLAATT);
  });

  // Feil 3: svaret fra en runde som startet før endringen, satte feltet tilbake.
  it("lar ikke et sent svar overskrive et valg gjort mens lagringen pågår", async () => {
    await renderSteg();
    server.forsinkelse = () => 1500;

    // Runden starter ved 500 ms og sender PUT for periode 1, 2 og 3 etter hverandre.
    // PUT for periode 3 sendes ved 3500 ms og får svar ved 5000 ms.
    await velgResultat(3, AVSLAATT);
    await vent(4000);
    await velgResultat(3, INNVILGET);
    await vent(1100);

    expect(resultat(3).value).toBe(INNVILGET);

    await kjørFerdig();
    expect(resultat(3).value).toBe(INNVILGET);
    expect(server.perioder.get(3)?.innvilgelsesResultat).toBe(INNVILGET);
  });

  // Feil 3: to runder gikk samtidig, så API-et kunne behandle den eldste PUT-en sist.
  it("kjører bare én lagringsrunde om gangen, så siste valg står i databasen", async () => {
    await renderSteg();
    server.forsinkelse = (kallNr) => (kallNr < 3 ? 1500 : 100);

    await velgResultat(3, AVSLAATT);
    await vent(1000);
    await velgResultat(3, INNVILGET);
    await kjørFerdig();

    expect(server.maksSamtidige).toBe(1);
    expect(server.perioder.get(3)?.innvilgelsesResultat).toBe(INNVILGET);
    expect(resultat(3).value).toBe(INNVILGET);
  });

  it("sender bare én POST for en ny rad som endres mens POST-en pågår", async () => {
    await renderSteg();
    server.forsinkelse = (_kallNr, action) => (action.type === "OPPRETT" ? 1500 : 0);

    await leggTilUtfyltRad();
    await vent(1000); // runden startet ved 500 ms, POST for den nye raden pågår
    await act(async () => {
      fireEvent.change(dekning(4), { target: { value: FTRL_2_9_FØRSTE_LEDD_A_HELSE } });
    });
    await kjørFerdig();

    expect(server.kall.filter((k) => k.type === "OPPRETT")).toHaveLength(1);
    const nyId = [...server.perioder.keys()].find((id) => id > 3) as number;
    expect(server.perioder.get(nyId)?.trygdedekning).toBe(FTRL_2_9_FØRSTE_LEDD_A_HELSE);
    expect(rad(4)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_A_HELSE, innvilgelsesResultat: AVSLAATT });
  });

  it("skriver svarene til riktige rader når en rad slettes mens lagringen pågår", async () => {
    await renderSteg();
    server.forsinkelse = (_kallNr, action) => (action.type === "SLETT" ? 0 : 1500);

    await velgResultat(3, AVSLAATT);
    await vent(600); // PUT for periode 1 pågår
    await slettRad(2);
    await kjørFerdig();

    expect(screen.queryByRole("combobox", { name: "Resultat periode 3" })).not.toBeInTheDocument();
    expect(rad(1)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_B_PENSJON, innvilgelsesResultat: AVSLAATT });
    expect(rad(2)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON, innvilgelsesResultat: AVSLAATT });
    expect(server.perioder.has(2)).toBe(false);
    expect(server.perioder.get(3)?.innvilgelsesResultat).toBe(AVSLAATT);
    const indeksSlett = server.kall.findIndex((k) => k.type === "SLETT");
    expect(server.kall.slice(indeksSlett).some((k) => k.periodeId === 2 && k.type === "OPPDATER")).toBe(false);
  });

  it("sletter perioden i databasen når en ny rad slettes mens POST-en for den pågår", async () => {
    await renderSteg();
    server.forsinkelse = (_kallNr, action) => (action.type === "OPPRETT" ? 1500 : 0);

    await leggTilUtfyltRad();
    await vent(600); // runden startet ved 500 ms, POST for den nye raden pågår
    await slettRad(4);
    await kjørFerdig();

    expect(server.kall.filter((k) => k.type === "OPPRETT")).toHaveLength(1);
    expect([...server.perioder.keys()]).toEqual([1, 2, 3]);
    expect(screen.queryByRole("combobox", { name: "Resultat periode 4" })).not.toBeInTheDocument();
  });

  it("sender ingen DELETE når en ny rad som ikke er lagret, slettes", async () => {
    await renderSteg();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Legg til periode" }));
    });
    await slettRad(4);
    await kjørFerdig();

    expect(server.kall.filter((k) => k.type !== "OPPDATER")).toHaveLength(0);
    expect(screen.queryByRole("combobox", { name: "Resultat periode 4" })).not.toBeInTheDocument();
  });

  it("fjerner riktig rad når to slettinger får svar i en annen rekkefølge", async () => {
    await renderSteg();
    server.forsinkelse = (_kallNr, action) => (action.periodeId === 1 ? 200 : 1000);

    await slettRad(1);
    await slettRad(2); // periode 2 står på rad 1 når svaret for den kommer
    await kjørFerdig();

    expect([...server.perioder.keys()]).toEqual([3]);
    expect(screen.queryByRole("combobox", { name: "Resultat periode 2" })).not.toBeInTheDocument();
    expect(rad(1)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON, innvilgelsesResultat: INNVILGET });
  });

  it("setter sluttdato 10 år frem og lagrer alle periodene når ukjent sluttdato velges", async () => {
    tilstand.soknadsperiode = { fom: "2026-01-01" };
    await renderSteg();

    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });
    await kjørFerdig();

    expect(dispatchMock).toHaveBeenCalledWith({ type: "LAGRE_UKJENT_SLUTTDATO", verdi: true });
    expect(server.perioder.get(3)?.tomDato).toBe("2036-09-24");
    expect(server.perioder.get(1)?.tomDato).toBe("2026-09-23");
    expect(server.perioder.get(2)?.tomDato).toBe("2026-09-23");
    expect(rad(1)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_B_PENSJON, innvilgelsesResultat: AVSLAATT });
    expect(rad(2)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_A_HELSE, innvilgelsesResultat: INNVILGET });
    expect(rad(3)).toEqual({ trygdedekning: FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON, innvilgelsesResultat: INNVILGET });
  });
});

describe("hentInformasjonstekst", () => {
  it("returnerer pliktig-tekst når medlemskapsTypeErPliktig er true, uavhengig av andre parametere", () => {
    expect(hentInformasjonstekst(MANGLENDE_INNBETALING_TRYGDEAVGIFT, true, true)).toMatch(/pliktig medlemskap/);
  });

  it("returnerer ny-vurdering-tekst for NY_VURDERING", () => {
    expect(hentInformasjonstekst(NY_VURDERING, false, false)).toMatch(/ny vurdering av frivillig medlemskap/);
  });

  it("returnerer delvis-opphør-tekst når erDelvisOpphørValgt er true", () => {
    expect(hentInformasjonstekst(MANGLENDE_INNBETALING_TRYGDEAVGIFT, false, true)).toBe(
      'Forkort perioden med resultat "Innvilget", og legg deretter til resterende periode med resultat "opphørt". Opphørsdatoen for medlemskapet blir startdatoen for den opphørte perioden.',
    );
  });

  it("returnerer manglende-innbetaling-tekst når erDelvisOpphørValgt er false", () => {
    expect(hentInformasjonstekst(MANGLENDE_INNBETALING_TRYGDEAVGIFT, false, false)).toMatch(
      /Ved manglende innbetaling vises tidligere innvilgede medlemskapsperioder/,
    );
  });

  it("returnerer generisk tekst for øvrige behandlingstyper", () => {
    expect(hentInformasjonstekst("ANNEN_TYPE", false, false)).toMatch(/Ved frivillig medlemskap/);
  });
});
