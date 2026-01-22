import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, HELSEUTGIFTDEKKESPERIODE, BEHANDLINGER } from "../../api-constants";
import { HelseutgiftdekkesperiodeForAvgift } from "../types/periodeTyper";

/**
 * DTO for CRUD-operasjoner på helseutgiftdekkesperiode.
 * Utvider Helseutgiftdekkesperiode med bostedLandkode (påkrevd for backend).
 * Utelater id, type og redigerbar som kun brukes i lesekontekst.
 */
export interface HelseutgiftDekkesPeriodeDto extends Pick<HelseutgiftdekkesperiodeForAvgift, "fomDato" | "tomDato"> {
  bostedLandkode: string;
}

export const opprettHelseutgiftDekkesPeriode = (behandlingID: number, data: HelseutgiftDekkesPeriodeDto) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`, data);

export const oppdaterHelseutgiftDekkesPeriode = (behandlingID: number, data: HelseutgiftDekkesPeriodeDto) =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`, data);

export const hentHelseutgiftDekkesPeriode = (behandlingID: number): Promise<HelseutgiftDekkesPeriodeDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`);
