import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, PENSJONSOPPTJENING } from "../../api-constants";

export type PensjonsopptjeningKilde = "SKATT" | "AVGIFTSSYSTEMET" | "MELOSYS" | "UKJENT";

export interface PensjonsopptjeningPeriode {
  aar: number;
  pgi: number;
  kilde: PensjonsopptjeningKilde;
  inntektType: string;
  inntektTypeDekode?: string;
  registrert?: string;
  oppdatert?: string;
}

export interface PensjonsopptjeningRespons {
  perioder: PensjonsopptjeningPeriode[];
}

export const hentPensjonsopptjening = (behandlingID: number): Promise<PensjonsopptjeningRespons> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${PENSJONSOPPTJENING}`);
