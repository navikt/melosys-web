import { object, string } from "yup";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN } from "../../../../kodeverk/feilmeldinger";

const { DELVIS_INNVILGELSE } = MKV.Koder.anmodningsperiodesvartyper;
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const artikkel16_motta_svar = object().shape({
  endretPeriode: object().when("$anmodningsperiodeSvarType", {
    is: (anmodningsperiodeSvarType) => anmodningsperiodeSvarType === DELVIS_INNVILGELSE,
    then: (schema) =>
      schema.shape({
        fom: string().erGyldigDato().erInnenforSoknadsperioden().required(MAA_FYLLES_UT),
        tom: string().erGyldigDato().erInnenforSoknadsperioden().erEtterDatofelt("fom").required(MAA_FYLLES_UT),
      }),
  }),
  begrunnelseFritekst: string().nullable().max(10000, DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN),
});

export default artikkel16_motta_svar;
