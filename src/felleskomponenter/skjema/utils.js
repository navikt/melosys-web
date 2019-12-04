import * as Utils from '../../utils';

export const mapReduxFormFeilTilNavFeil = meta => {
  const { error } = meta;

  if (!error) return undefined;

  /* Støtter objekter som feilmeldinger */
  const feilmelding = Utils._isObject(error) ? error.melding : error;

  return { feilmelding };
};
