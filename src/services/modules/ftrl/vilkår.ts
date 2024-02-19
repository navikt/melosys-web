import { VilkårOgBegrunnelser } from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/typer";
import { _isEmpty } from "../../../utils";
// import { API_BASE_URL, FTRL } from "../../api-constants";
// import { getAsJson } from "../../utils";

export const hentVilkår = (
  bestemmelseID: string,
  avklarteFakta: Map<string, string>,
  behandlingID: string
): Promise<{ vilkår: VilkårOgBegrunnelser[] }> =>
  new Promise((resolve, reject) => {
    console.log({ behandlingID, avklartFakta: avklarteFakta, size: avklarteFakta.size });
    if (bestemmelseID === "" || avklarteFakta.size === 0) {
      reject();
    }

    const vilkår = [
      {
        vilkår: "FTRL_2_8_FORUTGÅENDE_TRYGDETID",
        defaultOppfylt: true,
        muligeBegrunnelser: [],
      } as VilkårOgBegrunnelser,
      {
        vilkår: "FTRL_2_7A_SKIP_UTENFOR_EØS",
        defaultOppfylt: false,
        muligeBegrunnelser: [],
      } as VilkårOgBegrunnelser,
      {
        vilkår: "FTRL_2_1A_TRYGDEKOORDINGERING",
        defaultOppfylt: null,
        muligeBegrunnelser: [],
      } as VilkårOgBegrunnelser,
    ];
    resolve({ vilkår });
  });
// getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelseID}/vilkaar/?behandling=${behandlingID}`);
