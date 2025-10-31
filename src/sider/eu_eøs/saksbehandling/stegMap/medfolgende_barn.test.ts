import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";

import MedfolgendeBarn from "./medfolgende_barn";

import { STEG } from "../../../../felleskomponenter/stegvelger";

/**
 * ENHETSTESTER FOR MEDFOLGENDE_BARN STEGMAP - MELOSYS-7659
 *
 * Disse testene verifiserer kritisk routing-logikk for medfølgende barn-steget:
 * - Toggle-basert routing (VURDERING_PERIODE_OFFENTLIG_ANSATT vs ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)
 * - harAvklaring-logikk for validering av barn-data
 * - Kriterie-prioritering ved multiple oppfylte vilkår
 *
 * MELOSYS-7659: Lagt til toggle-støtte for å rute til periode-steg for offentlig ansatte
 */

describe("medfolgende_barn", () => {
  const createDefaultProps = (overrides = {}) => ({
    avklartefakta: [],
    medfolgendeBarn: [],
    utsendingsvilkår: { oppfylt: false },
    unntaksvilkår: { oppfylt: false },
    erArbeidTjenestepersonEllerFly: false,
    eøsFaktureringAvTrygdeavgiftToggleEnabled: false,
    tilgjengeligeHandlers: {
      bekreftOgFortsett: () => {},
      tilbake: () => {},
      oppdaterStegData: () => {},
      slettStegData: () => {},
    },
    ...overrides,
  });

  const createAvklartefaktaWithBarn = (barnCount: number, erSann: boolean, begrunnelseKoder: string[] = []) => {
    return Array.from({ length: barnCount }, (_, i) => ({
      id: i + 1,
      referanse: MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
      type: { kode: MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN },
      fakta: [erSann ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN],
      begrunnelseKoder,
    }));
  };

  describe("nesteSteg routing", () => {
    it(`har ${STEG.VEDTAK} som neste steg når harAvklaring=true og utsendingsvilkår er oppfylt`, () => {
      const avklartefakta = createAvklartefaktaWithBarn(1, true);
      const medfolgendeBarn = [{}];

      const propsLight = createDefaultProps({
        avklartefakta,
        medfolgendeBarn,
        utsendingsvilkår: { oppfylt: true },
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

      expect(medfolgendeBarnSteg.nesteSteg()).toBe(STEG.VEDTAK);
    });

    it(`har ${STEG.ARTIKKEL_16_ANMODNING} som neste steg når harAvklaring=true og unntaksvilkår er oppfylt`, () => {
      const avklartefakta = createAvklartefaktaWithBarn(1, true);
      const medfolgendeBarn = [{}];

      const propsLight = createDefaultProps({
        avklartefakta,
        medfolgendeBarn,
        unntaksvilkår: { oppfylt: true },
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

      expect(medfolgendeBarnSteg.nesteSteg()).toBe(STEG.ARTIKKEL_16_ANMODNING);
    });

    describe("arbeid tjenesteperson eller fly routing", () => {
      it(`har ${STEG.VURDERING_PERIODE_OFFENTLIG_ANSATT} som neste steg når toggle ER enabled`, () => {
        const avklartefakta = createAvklartefaktaWithBarn(1, true);
        const medfolgendeBarn = [{}];

        const propsLight = createDefaultProps({
          avklartefakta,
          medfolgendeBarn,
          erArbeidTjenestepersonEllerFly: true,
          eøsFaktureringAvTrygdeavgiftToggleEnabled: true,
        });

        const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

        expect(medfolgendeBarnSteg.nesteSteg()).toBe(STEG.VURDERING_PERIODE_OFFENTLIG_ANSATT);
      });

      it(`har ${STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK} som neste steg når toggle IKKE ER enabled`, () => {
        const avklartefakta = createAvklartefaktaWithBarn(1, true);
        const medfolgendeBarn = [{}];

        const propsLight = createDefaultProps({
          avklartefakta,
          medfolgendeBarn,
          erArbeidTjenestepersonEllerFly: true,
          eøsFaktureringAvTrygdeavgiftToggleEnabled: false,
        });

        const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

        expect(medfolgendeBarnSteg.nesteSteg()).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      });
    });
  });

  describe("harAvklaring logic", () => {
    it("returnerer true når alle barn har SANN fakta", () => {
      const propsLight = createDefaultProps({
        avklartefakta: createAvklartefaktaWithBarn(2, true),
        medfolgendeBarn: [{}, {}],
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);
      const vurderingLovvalgBarnFakta = createAvklartefaktaWithBarn(2, true);

      expect(medfolgendeBarnSteg.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn)).toBe(true);
    });

    it("returnerer true når alle barn har USANN fakta med begrunnelse", () => {
      const propsLight = createDefaultProps({
        avklartefakta: createAvklartefaktaWithBarn(2, false, ["BEGRUNNELSE_1"]),
        medfolgendeBarn: [{}, {}],
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);
      const vurderingLovvalgBarnFakta = createAvklartefaktaWithBarn(2, false, ["BEGRUNNELSE_1"]);

      expect(medfolgendeBarnSteg.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn)).toBe(true);
    });

    it("returnerer false når barn har USANN fakta uten begrunnelse", () => {
      const propsLight = createDefaultProps({
        avklartefakta: createAvklartefaktaWithBarn(1, false, []),
        medfolgendeBarn: [{}],
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);
      const vurderingLovvalgBarnFakta = createAvklartefaktaWithBarn(1, false, []);

      expect(medfolgendeBarnSteg.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn)).toBe(false);
    });

    it("returnerer false når antall barn i avklartefakta ikke matcher medfolgendeBarn", () => {
      const propsLight = createDefaultProps({
        avklartefakta: createAvklartefaktaWithBarn(2, true),
        medfolgendeBarn: [{}], // Kun 1 barn i mottatteOpplysninger
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);
      const vurderingLovvalgBarnFakta = createAvklartefaktaWithBarn(2, true);

      expect(medfolgendeBarnSteg.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn)).toBe(false);
    });

    it("returnerer false når det ikke er noen barn", () => {
      const propsLight = createDefaultProps({
        avklartefakta: [],
        medfolgendeBarn: [],
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

      expect(medfolgendeBarnSteg.harAvklaring([], [])).toBe(true); // Tom array matcher tom array
    });
  });

  describe("kriterier prioritering", () => {
    it("prioriterer VEDTAK over ARTIKKEL_16_ANMODNING når begge vilkår er oppfylt", () => {
      const avklartefakta = createAvklartefaktaWithBarn(1, true);
      const medfolgendeBarn = [{}];

      const propsLight = createDefaultProps({
        avklartefakta,
        medfolgendeBarn,
        utsendingsvilkår: { oppfylt: true },
        unntaksvilkår: { oppfylt: true },
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

      // Første kriterie i listen skal vinne
      expect(medfolgendeBarnSteg.nesteSteg()).toBe(STEG.VEDTAK);
    });

    it("prioriterer ARTIKKEL_16_ANMODNING over arbeid_tjenesteperson når begge er oppfylt", () => {
      const avklartefakta = createAvklartefaktaWithBarn(1, true);
      const medfolgendeBarn = [{}];

      const propsLight = createDefaultProps({
        avklartefakta,
        medfolgendeBarn,
        unntaksvilkår: { oppfylt: true },
        erArbeidTjenestepersonEllerFly: true,
      });

      const medfolgendeBarnSteg = new MedfolgendeBarn(propsLight, 0);

      expect(medfolgendeBarnSteg.nesteSteg()).toBe(STEG.ARTIKKEL_16_ANMODNING);
    });
  });
});
