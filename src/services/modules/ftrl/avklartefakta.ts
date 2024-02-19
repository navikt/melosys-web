import { AvklarteFakta } from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/typer";
import { API_BASE_URL, FTRL } from "../../api-constants";
import { getAsJson } from "../../utils";

export const hentAvklarteFakta = (
  bestemmelseID: string,
  behandlingID: string
): Promise<{ avklarteFakta: AvklarteFakta[] }> =>
  getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelseID}/avklartefakta/?behandlingID=${behandlingID}`);
