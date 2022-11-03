import { API_BASE_URL, MOTTATTE_OPPLYSNINGER } from "../../api-constants";

import { getAsJson, postAsJson } from "../../utils";

import { MottatteOpplysningerResDto, MottatteOpplysningerReqDto } from "./types";

export const hent = (behandlingID: number): Promise<MottatteOpplysningerResDto> =>
  getAsJson(`${API_BASE_URL}${MOTTATTE_OPPLYSNINGER}/${behandlingID}`);

export const send = (
  behandlingID: number,
  mottatteOpplysninger: MottatteOpplysningerReqDto
): Promise<MottatteOpplysningerResDto> =>
  postAsJson(`${API_BASE_URL}${MOTTATTE_OPPLYSNINGER}/${behandlingID}`, mottatteOpplysninger);
