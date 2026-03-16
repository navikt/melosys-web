import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import { FRITEKST_VALG } from "../../../../kodeverk/koder";

const { MAA_FYLLES_UT, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;

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
  innledningFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  begrunnelseFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurderingVedtakSchema;
