import { object, string } from "yup";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import MKV from "../../../melosyskodeverk";

const { MAA_FYLLES_UT, TIDLIGERE_ENN_FOM } = KV.Feilmeldinger;

const erIkkeInnvilgetMedÅpenSluttDato = {
  name: "Ikke godkjenn åpen sluttdato",
  message: { feilmelding: "Du kan ikke godkjenne en periode med åpen sluttdato" },
  test() {
    const resultat = this.parent.utfallRegistreringUnntak;
    const sluttdato = this.options.context.sluttDato;
    return !(resultat === MKV.Koder.utfallregistreringunntak.GODKJENT && Utils._isEmpty(sluttdato));
  },
};

const vurdering_unntak_medlemskap = object().shape({
  utfallRegistreringUnntak: string().test(erIkkeInnvilgetMedÅpenSluttDato).required(MAA_FYLLES_UT),
  fom: string().when("utfallRegistreringUnntak", {
    is: MKV.Koder.innvilgelsesResultat.DELVIS_GODKJENT,
    then: string().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tom: string().when("utfallRegistreringUnntak", {
    is: MKV.Koder.innvilgelsesResultat.DELVIS_GODKJENT,
    then: string().erGyldigDato().erEtterDatofelt("fom", TIDLIGERE_ENN_FOM).required(MAA_FYLLES_UT),
  }),
  bestemmelse: string().when("utfallRegistreringUnntak", {
    is: (vurdering) =>
      vurdering === MKV.Koder.utfallregistreringunntak.GODKJENT ||
      vurdering === MKV.Koder.utfallregistreringunntak.DELVIS_GODKJENT,
    then: string().required(MAA_FYLLES_UT),
  }),
});

export default vurdering_unntak_medlemskap;
