import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, PENSJONSOPPTJENING } from "../../api-constants";

export type PensjonsopptjeningKilde = "SKATT" | "AVGIFTSSYSTEMET" | "MELOSYS";

export interface PensjonsopptjeningPeriode {
  aar: number;
  pgi: number;
  kilde: PensjonsopptjeningKilde;
}

export interface PensjonsopptjeningRespons {
  inntektsAr: number;
  behandletAr: number;
  perioder: PensjonsopptjeningPeriode[];
}

export const hentPensjonsopptjening = (behandlingID: number): Promise<PensjonsopptjeningRespons> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${PENSJONSOPPTJENING}`);
