import { object, string } from "yup";
import * as KV from "../../../kodeverk";
import { FRITEKST } from "./vurderingVedtak";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_vedtak = object().shape({
  lovvalgsperiodeFom: string().erGyldigDato().required(MAA_FYLLES_UT),
  lovvalgsperiodeTom: string().erGyldigDato().erEtterDatofelt("lovvalgsperiodeFom").required(MAA_FYLLES_UT),
  nyVurderingBakgrunn: string()
    .when("$erNyVurdering", {
      is: true,
      then: string().required(MAA_FYLLES_UT).nullable(),
    })
    .nullable(),
  nyVurderingBakgrunnFritekst: string()
    .when(["$erNyVurdering", "nyVurderingBakgrunn"], {
      is: (erNyVurdering, nyVurderingBakgrunn) => erNyVurdering && nyVurderingBakgrunn === FRITEKST,
      then: string().erIkkeBlankHtml(MAA_FYLLES_UT).required(MAA_FYLLES_UT).nullable(),
    })
    .nullable(),
});

export default vurdering_vedtak;
