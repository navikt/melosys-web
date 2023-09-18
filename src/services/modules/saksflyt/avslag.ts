import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, AVSLAG } from "../../api-constants";

interface AvslagDto {
  fritekst: string;
}

export const avslåPgaManglendeOpplysninger = (behandlingID: number, body: AvslagDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${AVSLAG}/${behandlingID}/manglende-opplysninger`, body);
