import * as Utils from "../../utils";

export const normalizeInt = (value, previousValue) => {
  if (value === "") return null;

  const isInt = value.match(/^\d+$/g) !== null;
  return isInt ? value : previousValue;
};

export const normalizeDecimal = (value, previousValue) => {
  if (value === "") return null;

  const valuePreferDot = value.replace(",", ".");
  const isIntOrDecimal = valuePreferDot.match(/^\d+([.]\d*)?$/g) !== null;

  return isIntOrDecimal ? valuePreferDot : previousValue;
};

export const normalizeDate = (value) => {
  const vasketDato = Utils.dato.vaskInputDato(value);
  return vasketDato || value;
};

export const begrensAntallTegn = (antallTegn) => (value) => {
  return antallTegn && value.length > antallTegn ? value.substr(0, antallTegn) : value;
};
