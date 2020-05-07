import * as selectors from './selectors';

describe('serverinfoSelectors', () => {
  const lagState = ({
    namespace,
    cluster,
  }) => ({
    serverinfo: {
      data: {
        namespace,
        cluster,
      },
    },
  });

  describe('ErProdishSelector', () => {
    each([
      [
        true,
        'default',
        'prod-fss',
      ],
      [
        true,
        'default',
        'dev-fss',
      ],
      [
        false,
        'q2',
        'dev-fss',
      ],
      [
        false,
        'q2',
        'prod-fss',
      ],
    ]).it('returnerer %p for namespace=%p og cluster=%p', (forventetResultat, namespace, cluster) => {
      const state = lagState({ namespace, cluster });

      expect(selectors.ErProdishSelector(state)).toBe(forventetResultat);
    });
  });
});
