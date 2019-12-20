import * as Selectors from './selectors';

import MKV from '../../melosyskodeverk';

describe('Vilkar selectors', () => {
  describe('Artikkel12OppfyltSelector', () => {
    each([
      [
        true,
        [
          {
            vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_2,
            oppfylt: true,
          },
        ],
      ],
      [
        true,
        [
          {
            vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_1,
            oppfylt: true,
          },
        ],
      ],
      [
        false,
        [],
      ],
      [
        false,
        [
          {
            vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_1,
            oppfylt: false,
          },
        ],
      ],
      [
        false,
        [
          {
            vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART16_1,
            oppfylt: true,
          },
        ],
      ],
    ]).it('returnerer %p om lagrede vilkar er %j', (forventetResultat, vilkar) => {
      const state = {
        vilkar: {
          data: vilkar,
        },
      };

      expect(Selectors.Artikkel12OppfyltSelector(state)).toBe(forventetResultat);
    });
  });
});
