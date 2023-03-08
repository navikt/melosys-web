import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, UNNTAKSREGISTRERING } from "../../api-constants";

export const registrerUnntakFraMedlemskap = (behandlingID: number) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${UNNTAKSREGISTRERING}/${behandlingID}`);
