import MedfolgendeBarn from "./medfolgende_barn";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";
import { Avklartfakta } from "../../../../services/modules/avklartefakta";

const mockPropsLight = {
  generiskStegRedigerbart: true,
  tilgjengeligeHandlers: {
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
    oppdaterStegData: vi.fn(),
    slettStegData: vi.fn(),
  },
  avklartefakta: [] as Avklartfakta[],
  medfolgendeBarn: [],
};

// Helper for å lage avklart fakta for barn
const lagAvklartFaktaForBarn = (fakta: string, begrunnelseKoder: string[] = []): Avklartfakta => ({
  referanse: MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
  fakta: [fakta],
  begrunnelseKoder,
  avklartefaktaKode: null,
  begrunnelseFritekst: null,
  subjektID: null,
});

describe("MedfolgendeBarn", () => {
  describe("nesteSteg - routing logikk", () => {
    it("skal gå til VEDTAK når harAvklaring er true og utsendingsvilkår er oppfylt", () => {
      const avklartefakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        utsendingsvilkår: { oppfylt: true },
        unntaksvilkår: { oppfylt: false },
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta,
        medfolgendeBarn,
      });

      expect(steg.nesteSteg()).toBe(STEG.VEDTAK);
    });

    it("skal gå til ARTIKKEL_16_ANMODNING når harAvklaring er true og unntaksvilkår er oppfylt", () => {
      const avklartefakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        utsendingsvilkår: { oppfylt: false },
        unntaksvilkår: { oppfylt: true },
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta,
        medfolgendeBarn,
      });

      expect(steg.nesteSteg()).toBe(STEG.ARTIKKEL_16_ANMODNING);
    });

    it("skal gå til VURDERING_PERIODE_OFFENTLIG_ANSATT når harAvklaring er true og erArbeidTjenestepersonEllerFly er true", () => {
      const avklartefakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        utsendingsvilkår: { oppfylt: false },
        unntaksvilkår: { oppfylt: false },
        erArbeidTjenestepersonEllerFly: true,
        avklartefakta,
        medfolgendeBarn,
      });

      expect(steg.nesteSteg()).toBe(STEG.VURDERING_PERIODE);
    });

    it("skal ikke gå videre når harAvklaring er false", () => {
      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        utsendingsvilkår: { oppfylt: true },
        unntaksvilkår: { oppfylt: false },
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta: [],
        medfolgendeBarn: [{ id: "1" }],
      });

      expect(steg.nesteSteg()).toBeUndefined();
    });

    it("skal prioritere utsendingsvilkår over unntaksvilkår når begge er oppfylt", () => {
      const avklartefakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        utsendingsvilkår: { oppfylt: true },
        unntaksvilkår: { oppfylt: true },
        erArbeidTjenestepersonEllerFly: false,
        avklartefakta,
        medfolgendeBarn,
      });

      expect(steg.nesteSteg()).toBe(STEG.VEDTAK);
    });

    it("skal prioritere unntaksvilkår over erArbeidTjenestepersonEllerFly når begge er oppfylt", () => {
      const avklartefakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        utsendingsvilkår: { oppfylt: false },
        unntaksvilkår: { oppfylt: true },
        erArbeidTjenestepersonEllerFly: true,
        avklartefakta,
        medfolgendeBarn,
      });

      expect(steg.nesteSteg()).toBe(STEG.ARTIKKEL_16_ANMODNING);
    });
  });

  describe("harAvklaring", () => {
    it("skal returnere true når alle barn har SANN i fakta", () => {
      const vurderingLovvalgBarnFakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        avklartefakta: vurderingLovvalgBarnFakta,
        medfolgendeBarn,
      });

      expect(steg.harAvklaring(vurderingLovvalgBarnFakta, medfolgendeBarn)).toBe(true);
    });

    it("skal returnere true når alle barn har USANN med begrunnelseKoder", () => {
      const vurderingLovvalgBarnFakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.USANN, ["BEGRUNNELSE_1"])];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        avklartefakta: vurderingLovvalgBarnFakta,
        medfolgendeBarn,
      });

      expect(steg.harAvklaring(vurderingLovvalgBarnFakta, medfolgendeBarn)).toBe(true);
    });

    it("skal returnere false når antall fakta ikke matcher antall barn", () => {
      const vurderingLovvalgBarnFakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.SANN)];
      const medfolgendeBarn = [{ id: "1" }, { id: "2" }]; // 2 barn, men bare 1 fakta

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        avklartefakta: vurderingLovvalgBarnFakta,
        medfolgendeBarn,
      });

      expect(steg.harAvklaring(vurderingLovvalgBarnFakta, medfolgendeBarn)).toBe(false);
    });

    it("skal returnere false når et barn har USANN uten begrunnelseKoder", () => {
      const vurderingLovvalgBarnFakta = [lagAvklartFaktaForBarn(BOOLSK_STRING.USANN, [])];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        avklartefakta: vurderingLovvalgBarnFakta,
        medfolgendeBarn,
      });

      expect(steg.harAvklaring(vurderingLovvalgBarnFakta, medfolgendeBarn)).toBe(false);
    });

    it("skal returnere false når vurderingLovvalgBarnFakta er tom", () => {
      const vurderingLovvalgBarnFakta: Avklartfakta[] = [];
      const medfolgendeBarn = [{ id: "1" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        avklartefakta: vurderingLovvalgBarnFakta,
        medfolgendeBarn,
      });

      expect(steg.harAvklaring(vurderingLovvalgBarnFakta, medfolgendeBarn)).toBe(false);
    });

    it("skal returnere true for flere barn med SANN og USANN med begrunnelse", () => {
      const vurderingLovvalgBarnFakta: Avklartfakta[] = [
        lagAvklartFaktaForBarn(BOOLSK_STRING.SANN),
        lagAvklartFaktaForBarn(BOOLSK_STRING.USANN, ["BEGRUNNELSE_1"]),
      ];
      const medfolgendeBarn = [{ id: "1" }, { id: "2" }];

      const steg = new MedfolgendeBarn({
        ...mockPropsLight,
        avklartefakta: vurderingLovvalgBarnFakta,
        medfolgendeBarn,
      });

      expect(steg.harAvklaring(vurderingLovvalgBarnFakta, medfolgendeBarn)).toBe(true);
    });
  });
});
