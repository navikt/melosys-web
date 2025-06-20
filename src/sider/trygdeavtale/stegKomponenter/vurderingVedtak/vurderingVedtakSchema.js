import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import { FRITEKST } from "./vurderingVedtak";

const { MAA_FYLLES_UT, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;

const vurdering_vedtak = object().shape({
  lovvalgsperiodeFom: string().erGyldigDato().required(MAA_FYLLES_UT),
  lovvalgsperiodeTom: string().erGyldigDato().erEtterDatofelt("lovvalgsperiodeFom").required(MAA_FYLLES_UT),
  begrunnelseFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  innledningFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  nyVurderingBakgrunn: string().when("$erNyVurdering", {
    is: true,
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  nyVurderingBakgrunnFritekst: string().when(["$erNyVurdering", "nyVurderingBakgrunn"], {
    is: (erNyVurdering, nyVurderingBakgrunn) => erNyVurdering && nyVurderingBakgrunn === FRITEKST,
    then: (schema) =>
      schema.erIkkeBlankHtml(MAA_FYLLES_UT).required(MAA_FYLLES_UT).max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default vurdering_vedtak;
