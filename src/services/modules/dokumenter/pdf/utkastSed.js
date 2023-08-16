import { postAsJsonReceiveAsPDF } from "../../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../../api-constants";

export const forhandsvisSed = (behandlingID, sedType, data) =>
  postAsJsonReceiveAsPDF(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/sed/${sedType}/utkast`, data, true);
