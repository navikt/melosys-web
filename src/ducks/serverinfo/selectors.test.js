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

  describe('ErProdSelector', () => {
    each([
      [
        true,
        'default',
        'prod-fss',
      ],
      [
        false,
        'default',
        'dev-fss',
      ],
      [
        false,
        'q2',
        'prod-fss',
      ],
    ]).it('returnerer %p for namespace=%p og cluster=%p', (forventetResultat, namespace, cluster) => {
      const state = lagState({ namespace, cluster });

      expect(selectors.ErProdSelector(state)).toBe(forventetResultat);
    });
  });
});
