import * as selectors from './selectors';

describe('Journalforingselectors', () => {
  const lagState = ({
    status, data,
  }) => ({
    journalforing: {
      status,
      data,
    },
  });

  describe('FeilmeldingSelector', () => {
    it('feilmelding fra response ved 400-feil', () => {
      const state = lagState({
        status: 'ERROR',
        data: {
          data: {
            status: 400,
            message: 'Funksjonell feil',
          },
        },
      });

      const [feilmelding] = selectors.FeilmeldingSelector(state);
      expect(feilmelding.innhold).toEqual('Funksjonell feil');
    });

    it('generisk feilmelding ved 500-feil', () => {
      const state = lagState({
        status: 'ERROR',
        data: {
          data: {
            status: 500,
            message: 'Melding som ikke blir brukt',
          },
        },
      });

      const [feilmelding] = selectors.FeilmeldingSelector(state);
      expect(feilmelding.tittel).toEqual('Teknisk feil');
    });

    it('tom liste ved ingen feil', () => {
      const state = lagState({
        status: 'OK',
        data: {
          data: {},
        },
      });

      const feilmelding = selectors.FeilmeldingSelector(state);
      expect(feilmelding).toHaveLength(0);
    });
  });
});
