import { VilkårOgBestemmelser } from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/typer";
// import { API_BASE_URL, FTRL } from "../../api-constants";
// import { getAsJson } from "../../utils";

export const hentVilkår = (bestemmelseID: string, behandlingID: string): Promise<{ vilkår: VilkårOgBestemmelser[] }> =>
  new Promise((resolve) => {
    console.log({ bestemmelseID, behandlingID });
    const vilkår = [
      {
        vilkår: "FTRL_2_5_MEDFØLGENDE_A_E",
        defaultOppfylt: true,
        muligeBegrunnelser: [],
      } as VilkårOgBestemmelser,
      {
        vilkår: "FTRL_FORUTGÅENDE_TRYGDETID",
        defaultOppfylt: null,
        muligeBegrunnelser: [],
      } as VilkårOgBestemmelser,
    ];
    resolve({ vilkår });
  });
// getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/${bestemmelseID}/vilkaar/?behandling=${behandlingID}`);
