import { describe, it, expect, vi } from "vitest";
import Steg from "./steg";
import { STEG, FANE_STATUS } from "./typer";

describe("Steg", () => {
  class Inngangssteg extends Steg {
    constructor(propslight: any, posisjon: number) {
      super(propslight, posisjon);

      (this as any)._kriterier = [
        {
          exec: () => false,
          nesteSteg: STEG.ARTIKKEL_13_2_B,
        },
        {
          exec: () => true,
          nesteSteg: STEG.VEDTAK,
        },
      ];

      (this as any).id = STEG.INNGANG;
      (this as any)._samleRelevanteData = vi.fn();
      (this as any)._beregnRelevantUI = vi.fn();
    }
  }

  describe("byggSteg", () => {
    it("setter status FEIL dersom beregnRelevantUI returnerer null", () => {
      const inngangssteg = new Inngangssteg({}, 1);
      (inngangssteg as any).beregnRelevantUI = vi.fn(() => null as any);
      const byggetSteg = inngangssteg.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.FEIL);
    });

    it("setter status OK dersom steget har avklaring", () => {
      const inngangssteg = new Inngangssteg({}, 1);
      (inngangssteg as any).beregnRelevantUI = vi.fn(() => ({ harAvklaring: true }));
      const byggetSteg = inngangssteg.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.OK);
    });

    it("setter status UBEHANDLET dersom steget ikke har avklaring", () => {
      const inngangssteg = new Inngangssteg({}, 1);
      (inngangssteg as any).beregnRelevantUI = vi.fn(() => ({ harAvklaring: false }));
      const byggetSteg = inngangssteg.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.UBEHANDLET);
    });
  });

  describe("nesteSteg", () => {
    it("returnerer første steg med matchende kriterie", () => {
      const inngangssteg = new Inngangssteg({}, 1);
      const nesteSteg = inngangssteg.nesteSteg();

      expect(nesteSteg).toBe(STEG.VEDTAK);
    });
  });
});
