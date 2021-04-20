import moment from "moment";
import { postAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const oppdaterBehandlingsfrist = (behandlingID: string, behandlingsfrist: Date) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/behandlingsfrist`, {
    behandlingsfrist: moment(behandlingsfrist).format("YYYY-MM-DD"),
  });
