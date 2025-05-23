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
  nyVurderingBakgrunnFritekst: string().when("$erNyVurdering", {
    is: true,
    then: (schema) =>
      schema.when("nyVurderingBakgrunnValg", {
        is: FRITEKST_VALG,
        then: (schema2) => schema2.erIkkeBlankHtml().required(MAA_FYLLES_UT),
        otherwise: (schema2) => schema2.nullable(),
      }),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default vurderingVedtakSchema;
