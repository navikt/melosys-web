import { getAsJson, putAsText, postAsJson } from "../../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../../api-constants";

import { BehandlingResDto, EndreBehandlingReqDto } from "./types";

export const hentBehandling = (behandlingID: number): Promise<BehandlingResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);

export const endreBehandling = (behandlingID: number, body: EndreBehandlingReqDto) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/endre`, body);

export const ferdigbehandleNyVurdering = (behandlingID: number) =>
  putAsText(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/sett-til-ferdigbehandlet`);
