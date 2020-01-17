import * as Utils from '../../utils';

const skalReturnereFeilmelding = (meta, errorConfig) => {
  if (!errorConfig) return true;

  return (
    (errorConfig.submitFailed === meta.submitFailed) &&
    (errorConfig.active === meta.active) &&
    (errorConfig.touched === meta.touched)
  );
};

export const mapReduxFormFeilTilNavFeil = (meta, errorConfig) => {
  const { error } = meta;

  if (!error) return undefined;

  if (!skalReturnereFeilmelding(meta, errorConfig)) return undefined;

  /* Støtter objekter med key "melding" som feilmeldinger */
  const feilmelding = Utils._isObject(error) ? error.melding : error;

  return { feilmelding };
};
