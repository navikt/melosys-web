import { describe, it, expect, vi } from "vitest";
import SaksbehandlingVirksomheter from "./virksomheter";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";

describe("SaksbehandlingVirksomheter - Offentlig tjenesteperson/flyvende personell flyt", () => {
  // Helper for å lage oppsummering med behandlingsstatus og endretDato
  const createOppsummering = (
    behandlingsstatusKode: string = "UNDER_BEHANDLING",
    endretDato: string = "2026-02-01", // Default: etter flytProduksjonDato
  ) => ({
    behandlingsstatus: { kode: behandlingsstatusKode },
    endretDato,
  });

  const createMockPropsLight = (overrides = {}) => ({
    avklartefakta: [
      {
        referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
        fakta: ["TRUE"],
      },
    ],
    vilkar: [],
    arbeidsland: [{ kode: "SE" }],
    behandlingstema: { kode: "ARBEID_FLERE_LAND" },
    generiskStegRedigerbart: true,
    medfolgendeBarn: [],
    erArbeidTjenestepersonEllerFly: false,
    eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
    harTrygdeavgiftperiode: false,
    oppsummering: createOppsummering(),
    tilgjengeligeHandlers: {
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      oppdaterStegData: vi.fn(),
      slettStegData: vi.fn(),
    },
    ...overrides,
  });

  const createAvklartefaktaMedOrdinaerUtenArt12 = () => [
    {
      referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
      fakta: ["TRUE"],
    },
    {
      referanse: KV.Koder.avklartefaktaKoder.YRKESGRUPPE,
      fakta: [KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12],
    },
  ];

  // Helper for å lage VURDERING_LOVVALG_BARN avklartefakta med avklaring
  const createVurderingLovvalgBarnMedAvklaring = (antallBarn: number) =>
    Array.from({ length: antallBarn }, () => ({
      referanse: MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
      fakta: [BOOLSK_STRING.SANN],
      begrunnelseKoder: [],
    }));

  // Helper for å lage medfølgende barn
  const createMedfolgendeBarn = (antallBarn: number) =>
    Array.from({ length: antallBarn }, (_, i) => ({ navn: `Test Barn ${i + 1}` }));

  describe("Akseptansekriterie: Pågående behandling - Offentlig tjenesteperson/fly skal IKKE vise barn-steget", () => {
    it("Gitt at jeg er i en pågående behandling med offentlig tjenesteperson/fly, når jeg går videre fra Virksomhet, skal neste steg være Periode (ikke Barn)", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: true,
        erArbeidTjenestepersonEllerFly: true,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_PERIODE);
      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
    });

    it("Skal gå til ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK når toggle er av", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: true,
        erArbeidTjenestepersonEllerFly: true,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: false,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
    });
  });

  describe("Akseptansekriterie: Avsluttet behandling i innsyn - skal vise barn-steget hvis det finnes avklaring for barn", () => {
    it("Gitt at jeg er i en avsluttet behandling (innsyn) med offentlig tjenesteperson/fly, når behandlingen har avklaring for medfølgende barn, skal steget Barn vises", () => {
      const antallBarn = 1;
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: createMedfolgendeBarn(antallBarn),
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        avklartefakta: [
          {
            referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
            fakta: ["TRUE"],
          },
          ...createVurderingLovvalgBarnMedAvklaring(antallBarn),
        ],
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.MEDFOLGENDE_BARN);
    });

    it("Gitt at det finnes medfolgendeBarn men mangler tilsvarende VURDERING_LOVVALG_BARN avklartefakta, skal steget Barn IKKE vises (harAvklaring = false)", () => {
      // 1 barn men ingen VURDERING_LOVVALG_BARN avklartefakta -> harAvklaring = false
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: createMedfolgendeBarn(1),
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("Gitt at jeg er i innsyn med offentlig tjenesteperson/fly uten barn-data og toggle av, skal IKKE gå til barn-steget (harAvklaring = false for tomme lister)", () => {
      // Merk: Når medfolgendeBarn er tom og det ikke finnes VURDERING_LOVVALG_BARN,
      // er harAvklaring = false fordi begge lengder er 0 (ny logikk ekskluderer tomme lister)
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: [],
        eøsFaktureringAvTrygdeavgiftToggleEnabled: false,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      // harAvklaring er false for tomme lister, så går til ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK
      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
    });
  });

  describe("Andre flyter (gårDirekteTilArtikkel16)", () => {
    it("Ordinær flyt (gårDirekteTilArtikkel16) skal gå til VURDERING_PERIODE i saksbehandling når toggle er på", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: true,
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta: createAvklartefaktaMedOrdinaerUtenArt12(),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_PERIODE);
    });

    it("Ordinær flyt (gårDirekteTilArtikkel16) skal vise barn-steget i innsyn når det finnes avklaring for barn", () => {
      const antallBarn = 1;
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: false,
        medfolgendeBarn: createMedfolgendeBarn(antallBarn),
        avklartefakta: [
          ...createAvklartefaktaMedOrdinaerUtenArt12(),
          ...createVurderingLovvalgBarnMedAvklaring(antallBarn),
        ],
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.MEDFOLGENDE_BARN);
    });
  });

  describe("Edge cases", () => {
    it("Når det er mismatch mellom antall medfolgendeBarn og antall VURDERING_LOVVALG_BARN avklartefakta, skal det ikke vise barn-steget", () => {
      // 2 barn men bare 1 avklaring -> harAvklaring = false
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: createMedfolgendeBarn(2),
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        avklartefakta: [
          {
            referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
            fakta: ["TRUE"],
          },
          ...createVurderingLovvalgBarnMedAvklaring(1),
        ],
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("Når VURDERING_LOVVALG_BARN har USANN uten begrunnelseKoder, skal harAvklaring være false", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: createMedfolgendeBarn(1),
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        avklartefakta: [
          {
            referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
            fakta: ["TRUE"],
          },
          {
            referanse: MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
            fakta: [BOOLSK_STRING.USANN],
            begrunnelseKoder: [], // Mangler begrunnelse -> harAvklaring = false
          },
        ],
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("Når VURDERING_LOVVALG_BARN har USANN med begrunnelseKoder, skal harAvklaring være true", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: createMedfolgendeBarn(1),
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        avklartefakta: [
          {
            referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
            fakta: ["TRUE"],
          },
          {
            referanse: MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
            fakta: [BOOLSK_STRING.USANN],
            begrunnelseKoder: ["EN_BEGRUNNELSE"], // Har begrunnelse -> harAvklaring = true
          },
        ],
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.MEDFOLGENDE_BARN);
    });
  });

  describe("Innsyn: Dato-basert logikk for visning av legacy komponent", () => {
    const DATO_FØR_PRODUKSJON = "2025-11-01T00:00:00Z";
    const DATO_ETTER_PRODUKSJON = "2025-11-16T00:00:00Z"; // Etter 2025-11-15

    it("Avsluttet behandling FØR flytProduksjonDato skal bruke legacy komponent (gå til ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        oppsummering: createOppsummering("AVSLUTTET", DATO_FØR_PRODUKSJON),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("Avsluttet behandling ETTER flytProduksjonDato skal bruke ny komponent (gå til VURDERING_PERIODE)", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        oppsummering: createOppsummering("AVSLUTTET", DATO_ETTER_PRODUKSJON),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_PERIODE);
    });

    it("Behandling som IKKE er avsluttet skal bruke ny komponent uavhengig av dato", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        oppsummering: createOppsummering("UNDER_BEHANDLING", DATO_FØR_PRODUKSJON),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_PERIODE);
    });

    it("I saksbehandlingsmodus (redigerbar) skal alltid bruke ny komponent", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: true,
        erArbeidTjenestepersonEllerFly: true,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        oppsummering: createOppsummering("AVSLUTTET", DATO_FØR_PRODUKSJON),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.VURDERING_PERIODE);
    });
  });
});
