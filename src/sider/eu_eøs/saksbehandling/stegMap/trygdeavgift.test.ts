import Trygdeavgift from "./trygdeavgift";
import { STEG } from "../../../../felleskomponenter/stegvelger";

const mockPropsLight = {
  generiskStegRedigerbart: true,
  behandlingID: "123",
  tilgjengeligeHandlers: {
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
    oppdaterStegData: vi.fn(),
    slettStegData: vi.fn(),
  },
};

describe("Trygdeavgift", () => {
  describe("nesteSteg", () => {
    it("skal alltid gå til ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK som neste steg", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.nesteSteg()).toBe(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK);
    });
  });

  describe("steg konfiguration", () => {
    it("skal ha riktig steg-ID", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.id).toBe(STEG.TRYGDEAVGIFT);
    });

    it("skal ha riktig tittel", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.tittel).toBe("Trygdeavgift");
    });

    it("skal ha status OK", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.status).toBe("OK");
    });
  });

  describe("samleRelevanteData", () => {
    it("skal returnere behandlingID og redigerbart status", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      const relevantData = steg.samleRelevanteData({
        behandlingID: "456",
        generiskStegRedigerbart: false,
      });

      expect(relevantData).toEqual({
        behandlingID: "456",
        redigerbart: false,
      });
    });
  });

  describe("beregnRelevantUI", () => {
    it("skal alltid returnere harAvklaring true", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      const relevantUI = steg.beregnRelevantUI(mockPropsLight);

      expect(relevantUI).toEqual({
        harAvklaring: true,
      });
    });
  });

  describe("handlers", () => {
    it("skal ha bekreft handler", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.handlers.bekreft).toBeDefined();
      expect(typeof steg.handlers.bekreft).toBe("function");
    });

    it("skal ha tilbake handler", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.handlers.tilbake).toBeDefined();
      expect(typeof steg.handlers.tilbake).toBe("function");
    });

    it("skal ha oppdaterData handler", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.handlers.oppdaterData).toBeDefined();
      expect(typeof steg.handlers.oppdaterData).toBe("function");
    });

    it("skal ha slettData handler", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.handlers.slettData).toBeDefined();
      expect(typeof steg.handlers.slettData).toBe("function");
    });

    it("skal ha oppdaterStatus handler som no-op", () => {
      const steg = new Trygdeavgift(mockPropsLight);

      expect(steg.handlers.oppdaterStatus).toBeDefined();
      expect(typeof steg.handlers.oppdaterStatus).toBe("function");

      // No-op skal ikke kaste feil
      expect(() => steg.handlers.oppdaterStatus()).not.toThrow();
    });
  });
});
