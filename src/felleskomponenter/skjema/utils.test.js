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
  });
});
