import * as selectors from './selectors';

import MKV from '../../melosyskodeverk';

describe('FagsakerSelectors', () => {
  const lagState = ({ sakstype }) => ({
    fagsaker: {
      data: {
        sakstype,
      },
    },
  });

  describe('SakstypeKodeSelector', () => {
    it('returnerer korrekt sakstypekode', () => {
      const sakstype = { kode: MKV.Koder.sakstyper.EU_EOS };
      const state = lagState({ sakstype });

      expect(selectors.SakstypeKodeSelector(state)).toBe(MKV.Koder.sakstyper.EU_EOS);
    });
  });
});
