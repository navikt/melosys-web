import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, UNNTAKSPERIODER } from "../../api-constants";
import { Periode, Nullable } from "../types";

interface GodkjennUnntaksperiodeReqDto {
  varsleUtland: boolean;
  fritekst: string | null;
  endretPeriode: Nullable<Periode>;
  lovvalgsbestemmelse: string;
}

export const godkjenn = (behandlingID: number, data: GodkjennUnntaksperiodeReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/godkjenn`, data);

interface IkkeGodkjennUnnntaksperiodeReqDto {
  ikkeGodkjentBegrunnelseKoder: string[];
  begrunnelseFritekst: string;
}

export const ikkegodkjenn = (behandlingID: number, data: IkkeGodkjennUnnntaksperiodeReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${UNNTAKSPERIODER}/${behandlingID}/ikkegodkjenn`, data);
