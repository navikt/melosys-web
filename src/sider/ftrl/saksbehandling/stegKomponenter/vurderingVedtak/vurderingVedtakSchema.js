// noinspection ES6PreferShortImport

import { object, string } from "yup";
import * as KV from "../../../../../kodeverk";
import { FRITEKST_VALG } from "../../../../../kodeverk/koder";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN, MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_vedtak = object().shape({
  begrunnelseFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  innledningFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  trygdeavgiftFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  nyVurderingBakgrunnValg: string().when("$erNyVurdering", {
    is: true,
    then: string().required(MAA_FYLLES_UT),
    otherwise: string().nullable(),
  }),
  nyVurderingBakgrunnFritekst: string().when("$erNyVurdering", {
    is: true,
    then: string().when("nyVurderingBakgrunnValg", {
      is: FRITEKST_VALG,
      then: string().erIkkeBlankHtml().required(MAA_FYLLES_UT),
      otherwise: string().nullable(),
    }),
    otherwise: string().nullable(),
  }),
});

export default vurdering_vedtak;
