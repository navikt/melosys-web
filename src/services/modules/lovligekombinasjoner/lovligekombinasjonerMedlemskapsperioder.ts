import { getAsJson } from "../../utils";
import { API_BASE_URL, MEDLEMSKAPSPERIODER } from "../../api-constants";

export const hentBestemmelser = (behandlingID: number) =>
  getAsJson(`${API_BASE_URL}${MEDLEMSKAPSPERIODER}/${behandlingID}/bestemmelse/lovlige-kombinasjoner`);
