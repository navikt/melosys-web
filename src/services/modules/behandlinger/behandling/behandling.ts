import { getAsJson } from "../../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../../api-constants";

import { BehandlingResDto } from "./types";

export const hentBehandling = (behandlingID: number): Promise<BehandlingResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);
