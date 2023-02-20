import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { MAA_FYLLES_UT, TIDLIGERE_ENN_FOM } = KV.Feilmeldinger;

const unntak_medlemskap = object().shape({
  vurdering: string().required(MAA_FYLLES_UT),
  fom: string().when("vurdering", {
    is: MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET,
    then: string().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tom: string().when("vurdering", {
    is: MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET,
    then: string().erGyldigDato().erEtterDatofelt("fom", TIDLIGERE_ENN_FOM).required(MAA_FYLLES_UT),
  }),
  bestemmelse: string().when("vurdering", {
    is: (vurdering) =>
      vurdering === MKV.Koder.innvilgelsesResultat.INNVILGET ||
      vurdering === MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET,
    then: string().erIkkeBlank(MAA_FYLLES_UT).required(MAA_FYLLES_UT),
  }),
});

export default unntak_medlemskap;
