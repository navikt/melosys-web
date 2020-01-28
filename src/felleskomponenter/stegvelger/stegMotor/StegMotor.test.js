import StegMotor from './StegMotor';

import MKV from '../../../melosyskodeverk';
import { STEG } from './typer';
import Steg from './steg';

describe('Stegmotor', () => {
  describe('beregnAlleSteg', () => {
    class Inngangssteg extends Steg {
      constructor(propslight, posisjon) {
        super(propslight, posisjon);

        this.id = STEG.INNGANG;
        this._samleRelevanteData = jest.fn();
        this._beregnRelevantUI = jest.fn();
        this._kriterier = [{ exec: () => true, nesteSteg: STEG.YRKESAKTIVITET }];
      }
    }

    class Endretperiodesteg extends Steg {
      constructor(propslight, posisjon) {
        super(propslight, posisjon);

        this.id = STEG.ENDRET_PERIODE;
        this._samleRelevanteData = jest.fn();
        this._beregnRelevantUI = jest.fn();
        this._kriterier = [{ exec: () => true, nesteSteg: null }];
      }
    }

    class YrkesaktivitetSteg extends Steg {
      constructor(propslight, posisjon) {
        super(propslight, posisjon);

        this.id = STEG.YRKESAKTIVITET;
        this._samleRelevanteData = jest.fn();
        this._beregnRelevantUI = jest.fn();
        this._kriterier = [{ exec: () => true, nesteSteg: STEG.ENDRET_PERIODE }];
      }
    }

    const stegMap = new Map([
      [STEG.INNGANG, Inngangssteg],
      [STEG.ENDRET_PERIODE, Endretperiodesteg],
      [STEG.YRKESAKTIVITET, YrkesaktivitetSteg],
    ]);

    it('beregner alle steg i en flyt', () => {
      const props = {};
      const stegmotor = new StegMotor(props, stegMap);
      const alleSteg = stegmotor.beregnAlleSteg();

      expect(alleSteg[0].id).toBe(STEG.INNGANG);
      expect(alleSteg[1].id).toBe(STEG.YRKESAKTIVITET);
      expect(alleSteg[2].id).toBe(STEG.ENDRET_PERIODE);
    });

    it('Starter med inngangsteget dersom behandlingstype er SOEKNAD', () => {
      const props = {
        behandlingstype: {
          kode: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
          term: MKV.Terms.behandlinger.behandlingstyper.SOEKNAD,
        },
      };
      const stegmotor = new StegMotor(props, stegMap);
      const alleSteg = stegmotor.beregnAlleSteg();

      expect(alleSteg[0].id).toBe(STEG.INNGANG);
    });

    it('Starter med steget for endret periode dersom behandlingstype er ENDRET_PERIODE', () => {
      const props = {
        behandlingstype: {
          kode: MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE,
          term: MKV.Terms.behandlinger.behandlingstyper.ENDRET_PERIODE,
        },
      };
      const stegmotor = new StegMotor(props, stegMap);
      const alleSteg = stegmotor.beregnAlleSteg();

      expect(alleSteg[0].id).toBe(STEG.ENDRET_PERIODE);
    });
  });
});
