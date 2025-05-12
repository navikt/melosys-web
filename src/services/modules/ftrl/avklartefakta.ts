import { AvklarteFakta } from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/typer";
import { API_BASE_URL, FTRL } from "../../api-constants";
import { getAsJson } from "../../utils";

export const hentAvklarteFakta = (
  bestemmelse: string,
  behandlingID: number,
): Promise<{ avklarteFakta: AvklarteFakta[] }> =>
  getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelse}/avklartefakta/?behandlingID=${behandlingID}`);
