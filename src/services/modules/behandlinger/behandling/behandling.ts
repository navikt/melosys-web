import { getAsJson, postAsJson } from "../../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../../api-constants";

import { BehandlingResDto, EndreBehandlingReqDto } from "./types";

export const hentBehandling = (behandlingID: number): Promise<BehandlingResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);

export const endreBehandling = (behandlingID: number, body: EndreBehandlingReqDto) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/endre`, body);
