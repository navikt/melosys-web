import { postAsJsonReceiveAsPDF } from "../../../utils";
import { API_BASE_URL, DOKUMENTER } from "../../../api-constants";

export const forhandsvisSed = (behandlingID, sedType, data) =>
  postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/pdf/sed/utkast/${behandlingID}/${sedType}`, data, true);
