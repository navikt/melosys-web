import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, HELSEUTGIFTDEKKESPERIODE } from "../../api-constants";

export interface HelseutgiftDekkesPeriodeDto {
  fomDato: string;
  tomDato: string;
  bostedsland: string;
}

export const opprettHelseutgiftDekkesPeriode = (behandlingresultatID: number, data: HelseutgiftDekkesPeriodeDto) =>
  postAsJson(`${API_BASE_URL}${HELSEUTGIFTDEKKESPERIODE}/${behandlingresultatID}`, data);

export const hentHelseutgiftDekkesPeriode = (behandlingresultatID: number): Promise<HelseutgiftDekkesPeriodeDto> =>
  getAsJson(`${API_BASE_URL}${HELSEUTGIFTDEKKESPERIODE}/${behandlingresultatID}`);
