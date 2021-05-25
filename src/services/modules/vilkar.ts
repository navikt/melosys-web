import { getAsJson, postAsJson, putAsJson } from "../utils";
import { API_BASE_URL, INNGANGSVILKAAR, VILKAAR } from "../api-constants";

interface Vilkaar {
  vilkaar: string;
  oppfylt: boolean;
  begrunnelseKoder: string[];
  begrunnelseFritekst: string | null;
  begrunnelseFritekstEngelsk: string | null;
}

type VilkaarResDto = Vilkaar[];

export const hent = (behandlingID: number): Promise<VilkaarResDto> =>
  getAsJson(`${API_BASE_URL}${VILKAAR}/${behandlingID}`);

type VilkaarReqDto = Vilkaar[];

export const send = (behandlingID: number, data: VilkaarReqDto): Promise<VilkaarResDto> =>
  postAsJson(`${API_BASE_URL}${VILKAAR}/${behandlingID}`, data);

export const overstyrInngangvilkaar = (behandlingID: number) =>
  putAsJson(`${API_BASE_URL}${VILKAAR}/${behandlingID}/${INNGANGSVILKAAR}/overstyr`);
