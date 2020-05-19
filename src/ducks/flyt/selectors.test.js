import * as selectors from './selectors';
import MKV from '../../melosyskodeverk';

describe('FlytSelectors', () => {
  describe('UtpekingVurderingSelector', () => {
    const lagState = behandlingstema => ({
      behandlinger: {
        data: {
          oppsummering: {
            behandlingstema: {
              kode: behandlingstema,
            },
          },
        },
      },
      behandlingsresultat: {
        data: {
          utfallRegistreringUnntak: MKV.Koder.utfallregistreringunntak.GODKJENT,
          utfallUtpeking: MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT,
        },
      },
    });

    each([
      [
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
        MKV.Koder.utfallregistreringunntak.GODKJENT,
      ],
      [
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
        MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT,
      ],
    ]).describe('UtpekingVurderingSelector med behandlingstema %p', (behandlingstema, forventet) => {
      it(`returnerer ${forventet}`, () => {
        const state = lagState(behandlingstema);
        expect(selectors.UtpekingVurderingSelector(state)).toBe(forventet);
      });
    });
  });
});
