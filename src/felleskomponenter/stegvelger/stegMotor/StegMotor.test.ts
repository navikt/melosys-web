import { describe, it, expect, vi } from "vitest";
import StegMotor from "./StegMotor";

import { STEG } from "./typer";
import Steg from "./steg";

describe("Stegmotor", () => {
  describe("beregnAlleSteg", () => {
    class Inngangssteg extends Steg {
      constructor(propslight: any, posisjon: any) {
        super(propslight, posisjon);

        (this as any).id = STEG.INNGANG;
        (this as any)._samleRelevanteData = vi.fn();
        (this as any)._beregnRelevantUI = vi.fn();
        (this as any)._kriterier = [{ exec: () => true, nesteSteg: STEG.YRKESAKTIVITET }];
      }
    }

    class Endretperiodesteg extends Steg {
      constructor(propslight: any, posisjon: any) {
        super(propslight, posisjon);

        (this as any).id = STEG.ENDRET_PERIODE;
        (this as any)._samleRelevanteData = vi.fn();
        (this as any)._beregnRelevantUI = vi.fn();
        (this as any)._kriterier = [];
      }
    }

    class YrkesaktivitetSteg extends Steg {
      constructor(propslight: any, posisjon: any) {
        super(propslight, posisjon);

        (this as any).id = STEG.YRKESAKTIVITET;
        (this as any)._samleRelevanteData = vi.fn();
        (this as any)._beregnRelevantUI = vi.fn();
        (this as any)._kriterier = [{ exec: () => true, nesteSteg: STEG.ENDRET_PERIODE }];
      }
    }

    const stegMap = new Map([
      [STEG.INNGANG, Inngangssteg],
      [STEG.ENDRET_PERIODE, Endretperiodesteg],
      [STEG.YRKESAKTIVITET, YrkesaktivitetSteg],
    ]);

    it("beregner alle steg i en flyt", () => {
      const props = {};
      const forsteSteg = STEG.INNGANG;
      const stegmotor = new StegMotor(props, stegMap, forsteSteg);
      const alleSteg = stegmotor.beregnAlleSteg();

      expect(alleSteg[0].id).toBe(STEG.INNGANG);
      expect(alleSteg[1].id).toBe(STEG.YRKESAKTIVITET);
      expect(alleSteg[2].id).toBe(STEG.ENDRET_PERIODE);
    });

    it("Starter med det oppgitte første steget", () => {
      const steg = [STEG.INNGANG, STEG.ENDRET_PERIODE, STEG.YRKESAKTIVITET];
      steg.forEach((forsteSteg) => {
        const props = {};
        const stegmotor = new StegMotor(props, stegMap, forsteSteg);
        const alleSteg = stegmotor.beregnAlleSteg();

        expect(alleSteg[0].id).toBe(forsteSteg);
      });
    });
  });
});
