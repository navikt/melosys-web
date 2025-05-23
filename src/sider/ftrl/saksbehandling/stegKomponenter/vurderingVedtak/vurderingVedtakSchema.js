// noinspection ES6PreferShortImport

import { object, string } from "yup";
import * as KV from "../../../../../kodeverk";
import { FRITEKST_VALG } from "../../../../../kodeverk/koder";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN, MAA_FYLLES_UT } = KV.Feilmeldinger;

const skalHaNyVurderingBakgrunn = (erNyVurdering, erManglendeInnbetalingTrygdeavgift, erDelvisOpphør) =>
  erNyVurdering || (erManglendeInnbetalingTrygdeavgift && !erDelvisOpphør);

const vurdering_vedtak = object().shape({
  begrunnelseFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  innledningFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  trygdeavgiftFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  nyVurderingBakgrunnValg: string().when(["$erNyVurdering", "$erManglendeInnbetalingTrygdeavgift", "$erDelvisOpphør"], {
    is: (values) => skalHaNyVurderingBakgrunn(...values),
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  nyVurderingBakgrunnFritekst: string().when(
    ["$erNyVurdering", "$erManglendeInnbetalingTrygdeavgift", "$erDelvisOpphør", "nyVurderingBakgrunnValg"],
    {
      is: (erNyVurdering, erManglendeInnbetalingTrygdeavgift, erDelvisOpphør, nyVurderingBakgrunnValg) =>
        skalHaNyVurderingBakgrunn(erNyVurdering, erManglendeInnbetalingTrygdeavgift, erDelvisOpphør) &&
        nyVurderingBakgrunnValg === FRITEKST_VALG,
      then: (schema) => schema.erIkkeBlankHtml().required(MAA_FYLLES_UT),
      otherwise: (schema) => schema.nullable(),
    },
  ),
});

export default vurdering_vedtak;
