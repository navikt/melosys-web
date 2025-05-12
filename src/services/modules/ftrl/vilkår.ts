import { VilkårOgBegrunnelser } from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/typer";
import { API_BASE_URL, FTRL } from "../../api-constants";
import { getAsJson } from "../../utils";

export const hentVilkår = (
  bestemmelseID: string,
  avklarteFakta: Map<string, string>,
  behandlingID: number,
  behandlingstema: string,
): Promise<{ vilkår: VilkårOgBegrunnelser[] }> => {
  let queryParamsString = "";

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of avklarteFakta.entries()) {
    queryParamsString += `&${key}=${value}`;
  }

  return getAsJson(
    `${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelseID}/vilkaar/?behandlingID=${behandlingID}&behandlingstema=${behandlingstema}${queryParamsString}`,
  );
};
