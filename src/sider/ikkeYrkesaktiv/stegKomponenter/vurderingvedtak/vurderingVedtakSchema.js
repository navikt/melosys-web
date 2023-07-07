import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurderingVedtakSchema = object().shape({
  nyVurderingBakgrunnValg: string()
    .when("$erNyVurdering", {
      is: true,
      then: string().required(MAA_FYLLES_UT),
      otherwise: string().nullable(),
    })
    .nullable(),
  nyVurderingBakgrunnFritekst: string()
    .when("$erNyVurdering", {
      is: true,
      then: string()
        .when("nyVurderingBakgrunnValg", {
          is: "Fritekst",
          then: string().erIkkeBlankHtml().required(MAA_FYLLES_UT),
          otherwise: string().nullable(),
        })
        .nullable(),
      otherwise: string().nullable(),
    })
    .nullable(),
});

export default vurderingVedtakSchema;
