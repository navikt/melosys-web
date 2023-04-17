import { toInteger } from "lodash";

export function boolTilNorsk(value: boolean): string {
  return value ? "JA" : "NEI";
}

export function norskTilBool(value: string): boolean {
  return value ? value.toLowerCase() === "ja" : false;
}

export function boolTilStreng(value?: boolean | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value ? "true" : "false";
}

export function boolTilUppercaseStreng(value?: boolean | null): string | undefined {
  return boolTilStreng(value)?.toUpperCase();
}

export function strengTilBool(value: string): boolean {
  return value === "true";
}

export function uppercaseStrengTilBool(value?: string | null): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return strengTilBool(value.toLowerCase());
}

export function tryParseBool(value: string | boolean): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "TRUE") return true;
  if (value === "false" || value === "FALSE") return false;
  return undefined;
}

export function strengTilInt(value: string): number {
  return toInteger(value);
}

export function tryParseFloat(value?: number | string | null): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;

  const parsedValue = Number.parseFloat(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

export function tekstEllerDash(data?: string): string {
  return data || "-";
}

/* eslint-disable prefer-rest-params */
export function storeForbokstaver(originalOrd?: string | null): string | undefined {
  return originalOrd?.replace(
    /(\w|\u00C6|\u00D8|\u00C5)\S*/g,
    (ord) => ord.charAt(0).toUpperCase() + ord.substr(1).toLowerCase()
  );
}

export function storeForbokstaverForLand(land: string): string {
  return land
    ?.replace(/(\w|\u00C6|\u00D8|\u00C5)[^- ]*/g, (ord) => ord.charAt(0).toUpperCase() + ord.substring(1).toLowerCase())
    .replace("Usa", "USA")
    .replace(" Og ", " og ")
    .replace(" Of ", " of ")
    .replace(" I ", " i ");
}

export function arrayTilKonjunksjon(liste: string[] | string): string {
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

export function separerListeMedBindestrek(liste: string[] | string): string {
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

export function harStrengInnhold(streng?: string | null): boolean {
  // htmlEditor har defaultverdi <p></p> når feltet er tomt.
  return !!streng && streng.replace("<p></p>", "").trim() !== "";
}
