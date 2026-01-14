import { http, HttpResponse } from "msw";
import { createTestStore } from "../test-utils/createTestStore";

import * as operations from "./operations";
import * as KV from "../../kodeverk";

import MKV from "../../melosyskodeverk";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

interface TestState {
  mottatteOpplysninger: {
    data: {
      data: {
        periode: {
          tom: string;
          fom: string;
        };
      };
    };
  };
  avklartefakta: {
    data: any[];
  };
  behandlinger: {
    data: Array<{ behandlingID: number }>;
  };
  utpekingsperioder: {
    data: any[];
  };
}

describe("utpekingsperioder operations", () => {
  let initialState: TestState;

  beforeEach(() => {
    initialState = {
      mottatteOpplysninger: {
        data: {
          data: {
            periode: {
              tom: "",
              fom: "",
            },
          },
        },
      },
      avklartefakta: {
        data: [],
      },
      behandlinger: {
        data: [
          {
            behandlingID: 4,
          },
        ],
      },
      utpekingsperioder: {
        data: [],
      },
    };
  });

  describe("lagre", () => {
    it("updates state correctly on successful save", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/utpekingsperioder/4", () => {
          return HttpResponse.json({});
        }),
      );

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder).toBeDefined();
    });

    it("handles API errors correctly", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/utpekingsperioder/4", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder).toBeDefined();
    });
  });

  describe("OppdaterUtpekingsperioderState", () => {
    it("bygger utpekingsperiode dersom avklartfakta OMFATTES_I_LAND er annet land enn Norge for gitte lovvalgsbestemmelser", () => {
      const lovvalgsbestemmelser = [
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4,
      ];
      lovvalgsbestemmelser.forEach((lovvalgsbestemmelse) => {
        const avklartfakta = {
          avklartefaktaKode: null,
          referanse: KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND,
          fakta: ["CY"],
          subjektID: null,
          begrunnelseKoder: [],
          begrunnelseFritekst: null,
        };

        initialState.avklartefakta.data = [avklartfakta];

        const stegState = {
          lovvalgsbestemmelse,
          tilleggbestemmelse: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
        };

        const store = createTestStore(initialState);

        store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

        const finalState = store.getState();
        expect(finalState.utpekingsperioder.data).toEqual([
          expect.objectContaining({
            fomDato: initialState.mottatteOpplysninger.data.data.periode.fom,
            tomDato: initialState.mottatteOpplysninger.data.data.periode.tom,
            lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
            tilleggsbestemmelse: stegState.tilleggbestemmelse,
            lovvalgsland: avklartfakta.fakta[0],
          }),
        ]);
      });
    });

    it("bygger tom utpekingsperiode dersom avklartfakta OMFATTES_I_LAND er Norge", () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND,
        fakta: ["NO"],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1,
        tilleggbestemmelse: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([]);
    });

    it("bygger utpekingsperiode dersom søker har offentlig tjeneste i annet land", () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4,
        lovvalgsland: MKV.Koder.landkoder.BE,
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([
        expect.objectContaining({
          fomDato: initialState.mottatteOpplysninger.data.data.periode.fom,
          tomDato: initialState.mottatteOpplysninger.data.data.periode.tom,
          lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
          tilleggsbestemmelse: undefined,
          lovvalgsland: stegState.lovvalgsland,
        }),
      ]);
    });

    it("bygger tom utpekingsperiode dersom søker har offentlig tjeneste i Norge", () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4,
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([]);
    });

    it("bygger utpekingsperiode dersom søker har lønnet arbeid i annet land", () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3,
        lovvalgsland: MKV.Koder.landkoder.BE,
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([
        expect.objectContaining({
          fomDato: initialState.mottatteOpplysninger.data.data.periode.fom,
          tomDato: initialState.mottatteOpplysninger.data.data.periode.tom,
          lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
          tilleggsbestemmelse: undefined,
          lovvalgsland: stegState.lovvalgsland,
        }),
      ]);
    });

    it("bygger tom utpekingsperiode dersom søker har lønnet arbeid i Norge", () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.LoennetArbeidAntallLand.NORGE],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3,
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([]);
    });

    it("bygger tom utpekingsperiode dersom stegstate.lovvalgsland ikke er satt", () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3,
        lovvalgsland: undefined,
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState) as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([]);
    });
  });

  describe("resetUtpekingsperioderState", () => {
    it("resets utpekingsperioder state", () => {
      const store = createTestStore(initialState);

      store.dispatch(operations.resetUtpekingsperioderState() as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder.data).toEqual([]);
    });
  });

  describe("endrePeriode", () => {
    it("updates period dates", () => {
      const store = createTestStore(initialState);

      store.dispatch(operations.endrePeriode("12.12.2000", "12.12.2001") as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder).toBeDefined();
    });
  });
});
