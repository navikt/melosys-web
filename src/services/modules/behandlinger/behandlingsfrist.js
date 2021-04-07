import { postAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const oppdaterBehandlingsfrist = (behandlingID, behandlingsfrist) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/behandlingsfrist`, { behandlingsfrist });
