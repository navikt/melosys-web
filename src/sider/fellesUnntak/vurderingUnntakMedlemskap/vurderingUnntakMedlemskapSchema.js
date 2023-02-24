import { object, string } from "yup";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import MKV from "../../../melosyskodeverk";

const { MAA_FYLLES_UT, TIDLIGERE_ENN_FOM } = KV.Feilmeldinger;

const erIkkeInnvilgetMedÅpenSluttDato = {
  name: "Ikke godkjenn åpen sluttdato",
  message: { feilmelding: "Du kan ikke godkjenne en periode med åpen sluttdato" },
  test() {
    const resultat = this.parent.innvilgelsesResultat;
    const sluttdato = this.options.context.sluttDato;
    return !(resultat === MKV.Koder.innvilgelsesResultat.INNVILGET && Utils._isEmpty(sluttdato));
  },
};

const vurdering_unntak_medlemskap = object().shape({
  innvilgelsesResultat: string().test(erIkkeInnvilgetMedÅpenSluttDato).required(MAA_FYLLES_UT),
  fom: string().when("innvilgelsesResultat", {
    is: MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET,
    then: string().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tom: string().when("innvilgelsesResultat", {
    is: MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET,
    then: string().erGyldigDato().erEtterDatofelt("fom", TIDLIGERE_ENN_FOM).required(MAA_FYLLES_UT),
  }),
  bestemmelse: string().when("innvilgelsesResultat", {
    is: (vurdering) =>
      vurdering === MKV.Koder.innvilgelsesResultat.INNVILGET ||
      vurdering === MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET,
    then: string().required(MAA_FYLLES_UT),
  }),
});

export default vurdering_unntak_medlemskap;
