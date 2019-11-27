import * as SkjemaUtils from './utils';

describe('Skjema utils', () => {
  describe('mapReduxFormFeilTilNavFeil', () => {
    it('returnerer undefined for manglende error', () => {
      const meta = {};
      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta)).toBeUndefined();
    });

    it('returnerer feilmelding-objekt for string-error', () => {
      const meta = { error: 'Manglende felt' };
      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta)).toEqual({ feilmelding: meta.error });
    });

    it('returnerer feilmelding-objekt for objekt-error', () => {
      const meta = { error: { melding: 'Manglende felt' } };
      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta)).toEqual({ feilmelding: meta.error.melding });
    });

    each([
      'submitFailed',
      'touched',
      'active',
    ]).it('config %p kan tillate feilmelding å vises', property => {
      const meta = {
        error: { melding: 'Manglende felt' },
        [property]: true,
      };
      const errorConfig = { [property]: true };

      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta, errorConfig)).toEqual({ feilmelding: meta.error.melding });
    });

    each([
      'submitFailed',
      'touched',
      'active',
    ]).it('config %p kan hindre feilmelding i å vises', property => {
      const meta = {
        error: { melding: 'Manglende felt' },
        [property]: true,
      };
      const errorConfig = { [property]: false };

      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta, errorConfig)).toBeUndefined();
    });
  });
});
