import {
  object,
  array,
  number,
} from 'yup';

import { lagYupToReduxformErrorMapper } from './lagYupToReduxformErrorMapper';

describe('lagYupToReduxformErrorMapper', () => {
  it('throw Error hvis schema er falsy', () => {
    expect(() => {
      lagYupToReduxformErrorMapper(null);
    }).toThrow();
  });

  describe('mapper', () => {
    it('returnerer et error-objekt som forventes av redux-form', () => {
      const schema = object().shape({
        verdi: array().of(number())
          .required({ melding: 'Verdi er påkrevd' }),
      });
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(mapYupToReduxformError({})).toEqual({ verdi: { melding: 'Verdi er påkrevd' } });
      expect(mapYupToReduxformError({
        verdi: ['ikkeEtNummer', 3],
      }).verdi).toHaveLength(1);
    });

    it('returnerer ingen feilmeldinger for et tomt schema', () => {
      const schema = object().shape({});
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(mapYupToReduxformError({})).toEqual({});
    });
  });
});
