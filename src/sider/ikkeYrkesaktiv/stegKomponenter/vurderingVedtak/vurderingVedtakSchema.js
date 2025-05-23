import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import { FRITEKST_VALG } from "../../../../kodeverk/koder";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurderingVedtakSchema = object().shape({
  nyVurderingBakgrunnValg: string().when("$erNyVurdering", {
    is: true,
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  nyVurderingBakgrunnFritekst: string().when("nyVurderingBakgrunnValg", {
    is: FRITEKST_VALG,
    then: (schema) => schema.erIkkeBlankHtml().required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default vurderingVedtakSchema;
