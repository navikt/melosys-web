import { describe, it, expect, beforeEach, vi } from "vitest";
import ArbeidTjenestepersonEllerFlyVedtak from "./arbeid_tjenesteperson_eller_fly_vedtak";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import type { PropsLight } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";

const createMockPropsLight = (overrides = {}): PropsLight => ({
  generiskStegRedigerbart: true,
  aktivtSteg: false,
  avklartefakta: [],
  tilgjengeligeHandlers: {
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
    byggLovvalgsperioder: vi.fn(),
    oppdaterStegData: vi.fn(),
    slettStegData: vi.fn(),
  },
  ...overrides,
});

describe("ArbeidTjenestepersonEllerFlyVedtak steg-klasse", () => {
  describe("Constructor", () => {
    it("skal sette grunnleggende felter korrekt", () => {
      const propsLight = createMockPropsLight();
      const vedtak = new ArbeidTjenestepersonEllerFlyVedtak(propsLight, 7);

      expect(vedtak.id).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
      expect(vedtak.tittel).toBe("Vedtak");
      expect(vedtak.komponent).toBeDefined();
    });

    it("skal ha tom kriterier-liste som default", () => {
      const propsLight = createMockPropsLight();
      const vedtak = new ArbeidTjenestepersonEllerFlyVedtak(propsLight, 7);

      expect(vedtak.kriterier).toEqual([]);
    });
  });

  describe("Vedtak vises kun som neste steg etter Trygdeavgift", () => {
    it("skal håndteres av Trygdeavgift-stegets kriterier, ikke av Vedtak selv", () => {
      // Vedtak-steget har tom kriterier-array og vises kun hvis det er
      // inkludert i steg-kjeden av foregående steg (Trygdeavgift).
      // Dette testes i trygdeavgift.test.ts
      const propsLight = createMockPropsLight();
      const vedtak = new ArbeidTjenestepersonEllerFlyVedtak(propsLight, 7);

      expect(vedtak.kriterier).toEqual([]);
    });
  });
});
