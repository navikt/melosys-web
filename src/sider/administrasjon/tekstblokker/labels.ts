import { Endringstype, TekstblokkType } from "../../../services/modules/tekstblokker";

export const labelForType = (type: TekstblokkType): string => (type === "BREVMAL" ? "brevmal" : "tekstblokk");

const ENDRINGSTYPER: Record<Endringstype, string> = {
  OPPRETTET: "Opprettet",
  ENDRET: "Endret",
  SLETTET: "Slettet",
};

export const labelForEndringstype = (endringstype: Endringstype): string => ENDRINGSTYPER[endringstype] ?? endringstype;
