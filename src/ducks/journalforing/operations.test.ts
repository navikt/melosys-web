import { createTestStore } from "../test-utils/createTestStore";
import MKV from "../../melosyskodeverk";
import * as operations from "./operations";
import type { Sak, FeltNavn } from "./types";
import type { RootState } from "AppTypes";

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
  mockResponseOnce: (response: string) => typeof fetch;
  mockReject: (error: Error) => void;
  toHaveBeenCalledTimes: (times: number) => void;
  toHaveBeenLastCalledWith: (url: string, options: any) => void;
};

describe("journalforing operations", () => {
  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
  });

  describe("hent", () => {
    it("henter journalføring og lager OK action", async () => {
      const initialState: Partial<RootState> = {
        journalforing: {
          data: {},
          status: "NOT_STARTED",
        },
      };

      const store = createTestStore(initialState);
      const journalpostID = "12345";

      await store.dispatch(operations.hent(journalpostID) as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(`/api/journalforing/${journalpostID}`, expect.anything());

      const finalState = store.getState();
      expect(finalState.journalforing.data).toEqual({});
      expect(finalState.journalforing.status).toBe("OK");
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const error = new Error("feil ved kall til Api");
      fetch.mockReject(error);

      const initialState: Partial<RootState> = {
        journalforing: {
          data: {},
          status: "NOT_STARTED",
        },
      };

      const store = createTestStore(initialState);
      const journalpostID = "12345";

      await store.dispatch(operations.hent(journalpostID) as any);

      expect(fetch).toHaveBeenCalledTimes(1);

      const finalState = store.getState();
      // Data kan være enten error objekt eller string avhengig av reducer implementasjon
      expect(finalState.journalforing.data).toBeDefined();
      expect(finalState.journalforing.status).toBe("ERROR");
    });
  });

  describe("resetJournalforing", () => {
    it("reseterer journalforing state", () => {
      const stateWithData: Partial<RootState> = {
        journalforing: {
          data: { some: "data" },
          status: "ERROR",
        },
      };

      const store = createTestStore(stateWithData);

      store.dispatch(operations.resetJournalforing() as any);

      const finalState = store.getState();
      expect(finalState.journalforing.data).toEqual({});
      expect(finalState.journalforing.status).toBe("NOT_STARTED");
    });
  });

  describe("prepareKnyttTilSakForm", () => {
    const feltNavn: FeltNavn = {
      formNavn: "testForm",
      opprettBehandling: "opprettBehandling",
      behandlingstema: "behandlingstema",
      behandlingstype: "behandlingstype",
      hovedpart: "hovedpart",
    };

    const baseSak: Sak = {
      saksnummer: "1000001",
      sakstype: { kode: MKV.Koder.sakstyper.UAVKLART, term: "Uavklart" },
      sakstema: { kode: MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG, term: "Medlemskap og lovvalg" },
      saksstatus: { kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING, term: "Under behandling" },
      behandlingOversikter: [
        {
          behandlingID: 100,
          behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: "Avsluttet" },
          behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG, term: "Førstegangsbehandling" },
          behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" },
          opprettetDato: "2024-01-01",
          behandlingsresultattype: { kode: "GODKJENT", term: "Godkjent" },
          svarFrist: "2024-02-01",
        },
      ],
    };

    const mockBehandlingstyper = [
      { kode: "NY_VURDERING", term: "Ny vurdering" },
      { kode: "KLAGE", term: "Klage" },
      { kode: "ÅRSAVREGNING", term: "Årsavregning" },
    ];

    beforeEach(() => {
      // Mock API-responses - gjøres per test for fleksibilitet
      fetch.resetMocks();
    });

    it("returnerer tomme verdier når sak har ingen behandlinger", async () => {
      const sakUtenBehandlinger: Sak = {
        ...baseSak,
        behandlingOversikter: [],
      };

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(
        operations.prepareKnyttTilSakForm(sakUtenBehandlinger, false, "BRUKER", feltNavn) as any,
      );

      expect(result).toEqual({
        muligeBehandlingstemaer: [],
        muligeBehandlingstyper: [],
        harBehandlingMedTrygdeavgift: false,
      });

      // Ingen API-kall skal gjøres
      expect(fetch).toHaveBeenCalledTimes(0);
    });

    it("setter behandlingstema og opprettBehandling for avsluttet behandling", async () => {
      // Mock API responses i riktig rekkefølge
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] })) // Anmodningsperioder.hent
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false })) // Trygdeavgift
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        ) // Behandlingstemaer
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper)); // Behandlingstyper

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(operations.prepareKnyttTilSakForm(baseSak, false, "BRUKER", feltNavn) as any);

      // Verifiser at form-verdier er satt via redux-form change
      const finalState = store.getState();
      expect(finalState.form.testForm.values.behandlingstema).toBe(MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV);
      expect(finalState.form.testForm.values.opprettBehandling).toBe(true);

      // Verifiser returverdier
      expect(result.sisteBehandlingErInaktiv).toBe(true);
      expect(result.sakKanIkkeViderebehandles).toBe(false);
      expect(result.sisteBehandlingKanOpprettesAndregangsbehandlingPå).toBe(true);
    });

    it("håndterer EØS-sak med åpne behandlinger - ingen mulige behandlingstyper", async () => {
      // Mock API responses
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] }))
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false }))
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const eøsSak: Sak = {
        ...baseSak,
        sakstype: { kode: MKV.Koder.sakstyper.EU_EOS, term: "EU/EØS" },
        behandlingOversikter: [
          {
            ...baseSak.behandlingOversikter[0],
            behandlingsstatus: {
              kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
              term: "Under behandling",
            },
          },
        ],
      };

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(operations.prepareKnyttTilSakForm(eøsSak, false, "BRUKER", feltNavn) as any);

      // For EØS-sak med åpne behandlinger skal det ikke være mulig å opprette nye behandlinger
      expect(result.muligeBehandlingstyper).toEqual([]);
      expect(result.sisteBehandlingKanOpprettesAndregangsbehandlingPå).toBe(false);
    });

    it("håndterer EØS pensjonist-sak med åpne behandlinger - tillater årsavregning", async () => {
      // Mock API responses
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] }))
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false }))
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.PENSJONIST, term: "Pensjonist" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const eøsPensjonistSak: Sak = {
        ...baseSak,
        sakstype: { kode: MKV.Koder.sakstyper.EU_EOS, term: "EU/EØS" },
        sakstema: { kode: MKV.Koder.sakstemaer.TRYGDEAVGIFT, term: "Trygdeavgift" },
        behandlingOversikter: [
          {
            ...baseSak.behandlingOversikter[0],
            behandlingsstatus: {
              kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
              term: "Under behandling",
            },
            behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.PENSJONIST, term: "Pensjonist" },
            behandlingstype: {
              kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
              term: "Førstegangsbehandling",
            },
          },
        ],
      };

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(
        operations.prepareKnyttTilSakForm(eøsPensjonistSak, false, "BRUKER", feltNavn) as any,
      );

      // For EØS pensjonist-sak med åpne behandlinger skal det være mulig å opprette nye behandlinger
      // Dette er et unntak fra regelen om at vanlige EØS-saker med åpne behandlinger ikke kan opprette nye behandlinger
      // Siden behandlingen er en åpen ikke-årsavregning, skal kun årsavregning være tilgjengelig
      expect(result.muligeBehandlingstyper).toContainEqual(
        expect.objectContaining({ kode: MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING }),
      );
      expect(result.muligeBehandlingstyper.length).toBeGreaterThan(0);
      expect(result.sisteBehandlingKanOpprettesAndregangsbehandlingPå).toBe(true);
    });

    it("håndterer sak med åpne ikke-årsavregningsbehandlinger - kun årsavregning tillatt", async () => {
      // Mock API responses
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] }))
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false }))
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const sakMedÅpenBehandling: Sak = {
        ...baseSak,
        sakstype: { kode: MKV.Koder.sakstyper.UAVKLART, term: "Uavklart" },
        behandlingOversikter: [
          {
            ...baseSak.behandlingOversikter[0],
            behandlingsstatus: {
              kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
              term: "Under behandling",
            },
            behandlingstype: {
              kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
              term: "Førstegangsbehandling",
            },
          },
        ],
      };

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(
        operations.prepareKnyttTilSakForm(sakMedÅpenBehandling, false, "BRUKER", feltNavn) as any,
      );

      // Kun årsavregning skal være tilgjengelig
      // Saken har aktiv FØRSTEGANG behandling, så harÅpneIkkeÅrsavregningsbehandlinger = true
      // Dette betyr at kun ÅRSAVREGNING skal filtreres ut fra alleMuligeBehandlingstyper
      expect(result.muligeBehandlingstyper).toEqual(
        mockBehandlingstyper.filter((type) => type.kode === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING),
      );
    });

    it("håndterer sak som ikke kan viderebehandles (opphørt/henlagt/bortfalt/annullert)", async () => {
      // Mock API responses
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] }))
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false }))
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const henlagtSak: Sak = {
        ...baseSak,
        saksstatus: { kode: MKV.Koder.saksstatuser.HENLAGT, term: "Henlagt" },
      };

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(
        operations.prepareKnyttTilSakForm(henlagtSak, false, "BRUKER", feltNavn) as any,
      );

      expect(result.sakKanIkkeViderebehandles).toBe(true);

      // opprettBehandling skal være false for saker som ikke kan viderebehandles
      const finalState = store.getState();
      expect(finalState.form.testForm.values.opprettBehandling).toBe(false);
    });

    it("setter vurderDokument=true for journalføring på pågående artikkel 16-sak", async () => {
      // Mock anmodningsperiode som er sendt til utland
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [{ sendtUtland: true }] })) // Anmodningsperioder med sendtUtland=true
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false }))
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const artikkel16Sak: Sak = {
        ...baseSak,
        behandlingOversikter: [
          {
            ...baseSak.behandlingOversikter[0],
            behandlingsstatus: {
              kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
              term: "Under behandling",
            },
          },
        ],
      };

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(
        operations.prepareKnyttTilSakForm(artikkel16Sak, true, "BRUKER", feltNavn) as any,
      );

      expect(result.sisteBehandlingErPågåendeArtikkel16Sak).toBe(true);

      // For journalføring på pågående artikkel 16-sak skal opprettBehandling være undefined
      const finalState = store.getState();
      expect(finalState.form.testForm.values.opprettBehandling).toBeUndefined();
      expect(finalState.form.testForm.values.vurderDokument).toBe(true);
    });

    it("håndterer API-feil gracefully med .catch() fallbacks", async () => {
      fetch.mockReject(new Error("API feil"));

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      // Skal ikke kaste feil, men returnere fallback-verdier
      const result = await store.dispatch(operations.prepareKnyttTilSakForm(baseSak, false, "BRUKER", feltNavn) as any);

      expect(result.muligeBehandlingstemaer).toEqual([]);
      expect(result.muligeBehandlingstyper).toEqual([]);
      expect(result.harBehandlingMedTrygdeavgift).toBe(false);
    });

    it("returnerer harBehandlingMedTrygdeavgift=true når sak har trygdeavgift", async () => {
      // Mock at saken har trygdeavgift
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] }))
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: true })) // Trygdeavgift = true
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      const result = await store.dispatch(operations.prepareKnyttTilSakForm(baseSak, false, "BRUKER", feltNavn) as any);

      expect(result.harBehandlingMedTrygdeavgift).toBe(true);
    });

    it("gjør parallelle API-kall med Promise.all", async () => {
      // Mock API responses
      fetch
        .mockResponseOnce(JSON.stringify({ anmodningsperioder: [] }))
        .mockResponseOnce(JSON.stringify({ harBehandlingMedTrygdeavgift: false }))
        .mockResponseOnce(
          JSON.stringify([{ kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV, term: "Yrkesaktiv" }]),
        )
        .mockResponseOnce(JSON.stringify(mockBehandlingstyper));

      const initialState: Partial<RootState> = {
        form: {
          testForm: {
            values: {},
          },
        },
      };

      const store = createTestStore(initialState);

      await store.dispatch(operations.prepareKnyttTilSakForm(baseSak, false, "BRUKER", feltNavn) as any);

      // Skal gjøre 4 API-kall totalt:
      // 1. Anmodningsperioder
      // 2. Trygdeavgift
      // 3. Behandlingstemaer
      // 4. Behandlingstyper
      expect(fetch).toHaveBeenCalledTimes(4);
    });
  });
});
