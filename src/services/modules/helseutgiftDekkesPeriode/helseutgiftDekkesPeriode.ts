import { getAsJson, postAsJson, putAsJson, deleteAsJson } from "../../utils";
import { API_BASE_URL, HELSEUTGIFTDEKKESPERIODE, BEHANDLINGER } from "../../api-constants";
import { HelseutgiftdekkesperiodeForAvgift } from "../types/periodeTyper";

/**
 * DTO for CRUD-operasjoner på helseutgiftdekkesperiode.
 * Utvider Helseutgiftdekkesperiode med bostedLandkode (påkrevd for backend).
 * id er valgfritt – satt ved lesing fra backend, utelatt ved opprettelse.
 */
export interface HelseutgiftDekkesPeriodeDto extends Pick<HelseutgiftdekkesperiodeForAvgift, "fomDato" | "tomDato"> {
  id?: number;
  bostedLandkode: string;
}

export const opprettHelseutgiftDekkesPeriode = (behandlingID: number, data: HelseutgiftDekkesPeriodeDto) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`, data);

export const oppdaterHelseutgiftDekkesPeriode = (
  behandlingID: number,
  periodeId: number,
  data: HelseutgiftDekkesPeriodeDto,
) => putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}/${periodeId}`, data);

export const hentHelseutgiftDekkesPerioder = (behandlingID: number): Promise<HelseutgiftDekkesPeriodeDto[]> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}`);

export const slettHelseutgiftDekkesPeriode = (behandlingID: number, periodeId: number): Promise<void> =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}/${periodeId}`);

export const slettHelseutgiftDekkesPeriodeMedKilde = (behandlingID: number, kilde: string): Promise<void> =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${HELSEUTGIFTDEKKESPERIODE}?kilde=${kilde}`);
