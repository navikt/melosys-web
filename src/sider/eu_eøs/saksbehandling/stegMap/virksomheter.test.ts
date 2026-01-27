import { describe, it, expect, vi } from "vitest";
import SaksbehandlingVirksomheter from "./virksomheter";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import * as KV from "../../../../kodeverk";

describe("SaksbehandlingVirksomheter - Offentlig tjenesteperson/flyvende personell flyt", () => {
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

  describe("Akseptansekriterie: Avsluttet behandling i innsyn - skal vise barn-steget hvis det finnes barn-data", () => {
    it("Gitt at jeg er i en avsluttet behandling (innsyn) med offentlig tjenesteperson/fly, når behandlingen har medfølgende barn-data, skal steget Barn vises", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: [{ navn: "Test Barn" }],
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.MEDFOLGENDE_BARN);
    });

    it("Gitt at jeg er i en avsluttet behandling (innsyn) med offentlig tjenesteperson/fly, når behandlingen IKKE har medfølgende barn-data, skal steget Barn IKKE vises", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: [],
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("Gitt at jeg er i innsyn med offentlig tjenesteperson/fly uten barn-data og toggle av, skal gå til vedtak-steget", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: [],
        eøsFaktureringAvTrygdeavgiftToggleEnabled: false,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });
  });

  describe("Andre flyter skal fortsatt vise barn-steget som før", () => {
    it("Ordinær flyt (gårDirekteTilArtikkel16) skal fortsatt vise barn-steget i saksbehandling", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: true,
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta: createAvklartefaktaMedOrdinaerUtenArt12(),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.MEDFOLGENDE_BARN);
    });

    it("Ordinær flyt (gårDirekteTilArtikkel16) skal fortsatt vise barn-steget i innsyn", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta: createAvklartefaktaMedOrdinaerUtenArt12(),
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).toBe(STEG.MEDFOLGENDE_BARN);
    });
  });

  describe("Edge cases", () => {
    it("medfolgendeBarn som undefined skal behandles som ingen barn-data", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: undefined,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
      expect(nesteSteg).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });

    it("medfolgendeBarn som null skal behandles som ingen barn-data", () => {
      const propsLight = createMockPropsLight({
        generiskStegRedigerbart: false,
        erArbeidTjenestepersonEllerFly: true,
        medfolgendeBarn: null,
        eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
      });

      const virksomheter = new SaksbehandlingVirksomheter(propsLight, 3);
      const nesteSteg = virksomheter.nesteSteg();

      expect(nesteSteg).not.toBe(STEG.MEDFOLGENDE_BARN);
    });
  });
});
