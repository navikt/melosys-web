import { object, string } from "yup";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";

const { DELVIS_INNVILGELSE } = MKV.Koder.anmodningsperiodesvartyper;
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const artikkel16_motta_svar = object().shape({
  endretPeriode: object().when("$anmodningsperiodeSvarType", {
    is: DELVIS_INNVILGELSE,
    then: object().shape({
      fom: string().erGyldigDato().erInnenforSoknadsperioden().required(MAA_FYLLES_UT),
      tom: string().erGyldigDato().erInnenforSoknadsperioden().erEtterDatofelt("fom").required(MAA_FYLLES_UT),
    }),
  }),
});

export default artikkel16_motta_svar;
