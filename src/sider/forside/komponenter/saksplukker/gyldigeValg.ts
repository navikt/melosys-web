import { KTObject } from "@navikt/melosys-kodeverk";

export interface SaksplukkerFormData {
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
}

export const TOMT_SKJEMA: SaksplukkerFormData = { sakstype: "", sakstema: "", behandlingstema: "" };

// En liste som ikke er hentet ennå (undefined) kan ikke underkjenne et valg.
export interface LovligeValg {
  sakstyper?: KTObject[];
  sakstemaer?: KTObject[];
  behandlingstemaer?: KTObject[];
}

const erUlovlig = (kode: string, lovlige?: KTObject[]) =>
  !!kode && !!lovlige && !lovlige.some((lovlig) => lovlig.kode === kode);

/**
 * Tømmer et ulovlig valg og alt under det i kaskaden. Valgene kan komme fra URL-en, så
 * de er ikke nødvendigvis lovlige. Sakstemaene må være hentet for valgt sakstype, og
 * behandlingstemaene for valgt sakstype og sakstema.
 */
export const gyldigeValg = (valg: SaksplukkerFormData, lovlige: LovligeValg): SaksplukkerFormData => {
  if (erUlovlig(valg.sakstype, lovlige.sakstyper)) return TOMT_SKJEMA;
  if (erUlovlig(valg.sakstema, lovlige.sakstemaer)) return { ...valg, sakstema: "", behandlingstema: "" };
  if (erUlovlig(valg.behandlingstema, lovlige.behandlingstemaer)) return { ...valg, behandlingstema: "" };
  return valg;
};
