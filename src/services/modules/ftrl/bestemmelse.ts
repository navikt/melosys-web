import {
  AvklarteFakta,
  VilkårOgBestemmelser,
} from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/typer";
import { API_BASE_URL, FTRL } from "../../api-constants";
import { getAsJson } from "../../utils";

export const hentBestemmelser = (behandlingstema: string): Promise<{ bestemmelser: string[] }> =>
  getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/?behandlingstema=${behandlingstema}`);

export const hentVilkår = (bestemmelseID: string, behandlingID: string): Promise<{ vilkår: VilkårOgBestemmelser[] }> =>
  getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelseID}/vilkaar/?behandling=${behandlingID}`);

export const hentAvklarteFakta = (
  bestemmelseID: string,
  behandlingID: string
): Promise<{ avklarteFakta: AvklarteFakta[] }> =>
  getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelseID}/avklartefakta/?behandling=${behandlingID}`);
