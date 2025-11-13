import { describe, it, expect, beforeEach } from "vitest";
import Stegvelger from "./Stegvelger";
import { STEG, FANE_STATUS } from "./stegMotor";

/**
 * ENHETSTESTER FOR STEGVELGER
 *
 * Disse testene fokuserer på å teste individuelle metoder og ren logikk
 * i Stegvelger-komponenten uten å måtte rendre hele komponenten.
 *
 * Metodene som testes er:
 * - Stegberegning (beregnNesteSteg, beregnForrigeSteg)
 * - Steg-identifikasjon (erInngangsteg, erVedtakSteg, erSisteSteg)
 * - Feilmelding-håndtering (harMottatteOpplysningerFeilmeldinger, validerOgVisMottatteOpplysningerFeilmeldinger)
 * - PerioderStegState-bygging (hentPerioderStegState)
 *
 * VIKTIG: Full rendering av komponenten krever omfattende Redux-mocking.
 * For integrasjonstesting, bruk E2E-testene isteden.
 */

describe("Stegvelger - Component Structure", () => {
  it("kan importeres uten feil", () => {
    expect(Stegvelger).toBeDefined();
    expect(typeof Stegvelger).toBe("function"); // Redux connect returnerer en funksjon
  });

  it("STEG enum eksisterer", () => {
    expect(STEG).toBeDefined();
    expect(STEG.INNGANG).toBeDefined();
    expect(STEG.YRKESAKTIVITET).toBeDefined();
    expect(STEG.VEDTAK).toBeDefined();
  });

  it("STEG enum inneholder VURDERING_PERIODE", () => {
    expect(STEG.VURDERING_PERIODE).toBeDefined();
    expect(STEG.VURDERING_PERIODE).toBe("VURDERING_PERIODE");
  });

  it("STEG enum inneholder VURDERING_TRYGDEAVGIFT", () => {
    expect(STEG.VURDERING_TRYGDEAVGIFT).toBeDefined();
    expect(STEG.VURDERING_TRYGDEAVGIFT).toBe("VURDERING_TRYGDEAVGIFT");
  });

  it("FANE_STATUS enum eksisterer", () => {
    expect(FANE_STATUS).toBeDefined();
    expect(FANE_STATUS.UBEHANDLET).toBeDefined();
    expect(FANE_STATUS.OK).toBeDefined();
    expect(FANE_STATUS.FEIL).toBeDefined();
  });
});

interface StegvelgerInstance {
  state: {
    aktivtStegNummer: number;
    aktuelleSteg: Array<{
      id: string;
      stegPosisjon: number;
      vedtakSteg: boolean;
      tittel: string;
      status: string;
    }>;
    stegStores: Record<string, { hent: () => unknown }>;
    visMottatteOpplysningerFeilmeldinger: boolean;
  };
  props: {
    behandlingID: number;
    sakstype: string;
    mottatteOpplysningerFeilmeldinger: Record<string, unknown>;
    [key: string]: unknown;
  };
  beregnNesteSteg: () => number;
  beregnForrigeSteg: () => number;
  erInngangsteg: (stegnummer: number) => boolean;
  erVedtakSteg: (stegnummer: number) => boolean | undefined;
  erSisteSteg: (stegnummer: number) => boolean;
  harMottatteOpplysningerFeilmeldinger: () => boolean;
  hentPerioderStegState: () => Record<string, unknown>;
  validerOgVisMottatteOpplysningerFeilmeldinger: () => boolean;
  gjemMottatteOpplysningerFeilmeldinger: () => void;
  visMottatteOpplysningerFeilmeldinger: () => void;
}

describe("Stegvelger - Instance Methods", () => {
  // Vi kan teste instansmetoder ved å lage en instans av den ukoblede komponenten
  let instance: StegvelgerInstance;

  beforeEach(() => {
    // Hent den ukoblede komponenten (før Redux connect)
    const UnconnectedStegvelger = Stegvelger.WrappedComponent || Stegvelger;

    // Opprett en minimal instans med nødvendige props og state
    // @ts-expect-error - Vi bruker 'new' på en komponent for å teste instansmetoder direkte
    instance = new UnconnectedStegvelger({
      behandlingID: 1,
      sakstype: "EOS",
      stegMap: {},
      forsteSteg: STEG.INNGANG,
      redigerbart: true,
      mottatteOpplysningerFeilmeldinger: {},
      // Legg til alle påkrevde props som dummies
      anmodningsperiodesvar: [],
      arbeidsland: [],
      arbeidslandMedYrkesaktivitet: [],
      avklartefakta: {},
      behandlingsPerioder: {},
      lovvalgsperioder: [],
      oppsummering: { behandlingstype: { kode: "FORSTEGANGSBEH" } },
      saksopplysninger: {},
      vilkar: [],
      anmodningsperioder: [],
      anmodningErSendtUtland: false,
      generiskStegRedigerbart: true,
      erIDirekteTilArtikkel16Flyt: false,
      utpekingsperioder: [],
      omfattesIAnnetLand: false,
      vurderUtpekingValid: true,
      erArbeidEttLand: false,
      medfolgendeBarn: [],
      lagredeVirksomheter: [],
      soknadsperiode: {},
    });

    // Sett opp minimal state
    instance.state = {
      aktivtStegNummer: 0,
      aktuelleSteg: [
        { id: STEG.INNGANG, stegPosisjon: 0, vedtakSteg: false, tittel: "Inngang", status: FANE_STATUS.OK },
        {
          id: STEG.YRKESAKTIVITET,
          stegPosisjon: 1,
          vedtakSteg: false,
          tittel: "Yrkesaktivitet",
          status: FANE_STATUS.UBEHANDLET,
        },
        { id: STEG.VEDTAK, stegPosisjon: 2, vedtakSteg: true, tittel: "Vedtak", status: FANE_STATUS.UBEHANDLET },
      ],
      stegStores: {
        anmodningsperiodesvar: { hent: () => null },
        avklartefakta: { hent: () => null },
        lovvalgsbestemmelse: { hent: () => "ARTIKKEL_11_3_A" },
        tilleggbestemmelse: { hent: () => null },
        unntakfrabestemmelse: { hent: () => null },
        vilkaar: { hent: () => null },
        lovvalgsperiode: { hent: () => ({ fomDato: "2025-01-01", tomDato: "2025-12-31" }) },
        lovvalgsland: { hent: () => "NO" },
      },
      visMottatteOpplysningerFeilmeldinger: false,
    };
  });

  describe("beregnNesteSteg", () => {
    it("skal returnere neste stegnummer", () => {
      instance.state.aktivtStegNummer = 0;
      expect(instance.beregnNesteSteg()).toBe(1);

      instance.state.aktivtStegNummer = 1;
      expect(instance.beregnNesteSteg()).toBe(2);
    });

    it("skal fungere fra siste steg (kan gå utenfor bounds)", () => {
      instance.state.aktivtStegNummer = 2;
      expect(instance.beregnNesteSteg()).toBe(3);
    });
  });

  describe("beregnForrigeSteg", () => {
    it("skal returnere forrige stegnummer", () => {
      instance.state.aktivtStegNummer = 2;
      expect(instance.beregnForrigeSteg()).toBe(1);

      instance.state.aktivtStegNummer = 1;
      expect(instance.beregnForrigeSteg()).toBe(0);
    });

    it("skal fungere fra første steg (kan gi negativ verdi)", () => {
      instance.state.aktivtStegNummer = 0;
      expect(instance.beregnForrigeSteg()).toBe(-1);
    });
  });

  describe("erInngangsteg", () => {
    it("skal returnere true for første steg (posisjon 0)", () => {
      expect(instance.erInngangsteg(0)).toBe(true);
    });

    it("skal returnere false for andre steg", () => {
      expect(instance.erInngangsteg(1)).toBe(false);
      expect(instance.erInngangsteg(2)).toBe(false);
    });

    it("skal håndtere ugyldig stegnummer", () => {
      // Returnerer false når steg ikke finnes (undefined?.stegPosisjon === 0 er false)
      expect(instance.erInngangsteg(99)).toBe(false);
    });
  });

  describe("erVedtakSteg", () => {
    it("skal returnere true for vedtaksteg", () => {
      expect(instance.erVedtakSteg(2)).toBe(true);
    });

    it("skal returnere false for ikke-vedtaksteg", () => {
      expect(instance.erVedtakSteg(0)).toBe(false);
      expect(instance.erVedtakSteg(1)).toBe(false);
    });

    it("skal håndtere ugyldig stegnummer", () => {
      expect(instance.erVedtakSteg(99)).toBeUndefined();
    });
  });

  describe("erSisteSteg", () => {
    it("skal returnere true for siste steg", () => {
      expect(instance.erSisteSteg(2)).toBe(true);
    });

    it("skal returnere false for ikke-siste steg", () => {
      expect(instance.erSisteSteg(0)).toBe(false);
      expect(instance.erSisteSteg(1)).toBe(false);
    });

    it("skal returnere true for steg utenfor bounds", () => {
      expect(instance.erSisteSteg(3)).toBe(true);
      expect(instance.erSisteSteg(99)).toBe(true);
    });
  });

  describe("harMottatteOpplysningerFeilmeldinger", () => {
    it("skal returnere false når det ikke er feilmeldinger", () => {
      instance.props.mottatteOpplysningerFeilmeldinger = {};
      // !Utils._isEmpty({}) === false
      expect(instance.harMottatteOpplysningerFeilmeldinger()).toBe(false);
    });

    it("skal returnere true når det er feilmeldinger", () => {
      instance.props.mottatteOpplysningerFeilmeldinger = { feil: "En feilmelding" };
      // !Utils._isEmpty({feil: ...}) === true
      expect(instance.harMottatteOpplysningerFeilmeldinger()).toBe(true);
    });
  });

  describe("hentPerioderStegState", () => {
    it("skal hente perioderStegState fra alle relevante stores", () => {
      const result = instance.hentPerioderStegState();

      expect(result).toEqual({
        lovvalgsbestemmelse: "ARTIKKEL_11_3_A",
        tilleggbestemmelse: null,
        unntakfrabestemmelse: null,
        lovvalgsperiode: { fomDato: "2025-01-01", tomDato: "2025-12-31" },
        lovvalgsland: "NO",
      });
    });

    it("skal returnere struktur selv om stores returnerer null", () => {
      instance.state.stegStores = {
        lovvalgsbestemmelse: { hent: () => null },
        tilleggbestemmelse: { hent: () => null },
        unntakfrabestemmelse: { hent: () => null },
        lovvalgsperiode: { hent: () => null },
        lovvalgsland: { hent: () => null },
      };

      const result = instance.hentPerioderStegState();

      expect(result).toEqual({
        lovvalgsbestemmelse: null,
        tilleggbestemmelse: null,
        unntakfrabestemmelse: null,
        lovvalgsperiode: null,
        lovvalgsland: null,
      });
    });
  });

  describe("validerOgVisMottatteOpplysningerFeilmeldinger", () => {
    it("skal returnere true og kalle gjemMottatteOpplysningerFeilmeldinger når det ikke er feil", () => {
      instance.props.mottatteOpplysningerFeilmeldinger = {};
      let gjemKalt = false;
      instance.gjemMottatteOpplysningerFeilmeldinger = () => {
        gjemKalt = true;
      };

      const result = instance.validerOgVisMottatteOpplysningerFeilmeldinger();

      expect(result).toBe(true);
      expect(gjemKalt).toBe(true);
    });

    it("skal returnere false og kalle visMottatteOpplysningerFeilmeldinger når det er feil", () => {
      instance.props.mottatteOpplysningerFeilmeldinger = { feil: "Feilmelding" };
      let visKalt = false;
      instance.visMottatteOpplysningerFeilmeldinger = () => {
        visKalt = true;
      };

      const result = instance.validerOgVisMottatteOpplysningerFeilmeldinger();

      expect(result).toBe(false);
      expect(visKalt).toBe(true);
    });
  });
});
