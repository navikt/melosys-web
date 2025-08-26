import * as Utils from "../../utils";

const skalReturnereFeilmelding = (meta, errorConfig) => {
  if (!errorConfig) return true;

  return (
    errorConfig.submitFailed === meta.submitFailed &&
    errorConfig.active === meta.active &&
    errorConfig.touched === meta.touched
  );
};

export const mapReduxFormFeilTilNavFeil = (meta, errorConfig) => {
  const { error } = meta;

  if (!error) return undefined;

  if (!skalReturnereFeilmelding(meta, errorConfig)) return undefined;

  /* Støtter objekter med key "melding" som feilmeldinger */
  return Utils._isObject(error) ? error.melding : error;
};

// Liten helper: trekk ut tekst enten det er string eller { melding: string }
export const unwrapMelding = (v) => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "melding" in v) {
    const m = v.melding;
    return typeof m === "string" ? m : undefined;
  }
  return undefined;
};
