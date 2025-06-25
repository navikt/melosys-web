import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, HELSEUTGIFTDEKKESPERIODE, BEHANDLINGER } from "../../api-constants";

export interface HelseutgiftDekkesPeriodeDto {
  fomDato: string;
  tomDato: string;
  bostedLandkode: string;
}

export const opprettHelseutgiftDekkesPeriode = (behandlingID: number, data: HelseutgiftDekkesPeriodeDto) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`, data);

export const oppdaterHelseutgiftDekkesPeriode = (behandlingID: number, data: HelseutgiftDekkesPeriodeDto) =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`, data);

export const hentHelseutgiftDekkesPeriode = (behandlingID: number): Promise<HelseutgiftDekkesPeriodeDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`);
