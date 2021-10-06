import { toInteger } from "lodash";
import { BOOLSK_STRING } from "../constants";

export function boolTilNorsk(value) {
  return value ? "JA" : "NEI";
}

export function norskTilBool(value) {
  return value ? value.toLowerCase() === "ja" : false;
}

export function boolTilStreng(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value ? "true" : "false";
}

export function boolTilBOOLSK_STRING(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN;
}

export function strengTilBool(value) {
  return value === "true";
}

export function BOOLSK_STRINGTilBool(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value === BOOLSK_STRING.SANN;
}

export function tryParseBool(value) {
  if (value === "true" || value === "TRUE") return true;
  if (value === "false" || value === "FALSE") return false;
  return value; // undefined, null, bool
}

export function strengTilInt(value) {
  return toInteger(value);
}

export function tryParseFloat(value) {
  const parsedValue = Number.parseFloat(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

export function tekstEllerDash(data) {
  return data || "-";
}

/* eslint-disable prefer-rest-params */
export function storeForbokstaver(originalOrd) {
  return originalOrd?.replace(
    /(\w|\u00C6|\u00D8|\u00C5)\S*/g,
    (ord) => ord.charAt(0).toUpperCase() + ord.substr(1).toLowerCase()
  );
}

export function storeForbokstaverForLand(land) {
  return land
    ?.replace(/(\w|\u00C6|\u00D8|\u00C5)[^- ]*/g, (ord) => ord.charAt(0).toUpperCase() + ord.substr(1).toLowerCase())
    .replace("Usa", "USA")
    .replace(" Og ", " og ")
    .replace(" Of ", " of ")
    .replace(" I ", " i ");
}

export function arrayTilKonjunksjon(liste) {
  if (!liste) {
    return "";
  }
  if (typeof liste === "string") {
    return liste;
  }
  return liste.reduce((samling, element, index) => {
    const konjunksjon = index < liste.length - 2 ? ", " : " og ";
    const erVedSisteElement = index === liste.length - 1;
    return `${samling}${element}${!erVedSisteElement ? konjunksjon : ""}`;
  }, "");
}

export function separerListeMedBindestrek(liste) {
  if (!liste) {
    return "";
  }
  if (typeof liste === "string") {
    return liste;
  }
  return liste.reduce((s, e, i) => {
    return `${s}${e}${i === liste.length - 1 ? "" : " - "}`;
  }, "");
}
