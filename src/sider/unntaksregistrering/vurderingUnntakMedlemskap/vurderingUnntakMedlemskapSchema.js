import { object, string } from "yup";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import MKV from "../../../melosyskodeverk";

const { MAA_FYLLES_UT, TIDLIGERE_ENN_FOM } = KV.Feilmeldinger;
const { USA_ART5_9 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us;
const { CAN_ART11 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca;

const erIkkeInnvilgetMedÅpenSluttDatoGodkjentUtfall = {
  name: "Ikke godkjenn åpen sluttdato for GODKJENT utfall",
  message: { feilmelding: "Du kan ikke godkjenne en periode med åpen sluttdato" },
  test() {
    const resultat = this.parent.utfallRegistreringUnntak;
    const sluttdato = this.options.context.sluttDato;
    return !(resultat === MKV.Koder.utfallregistreringunntak.GODKJENT && Utils._isEmpty(sluttdato));
  },
};

const vurdering_unntak_medlemskap = object().shape({
  utfallRegistreringUnntak: string().test(erIkkeInnvilgetMedÅpenSluttDatoGodkjentUtfall).required(MAA_FYLLES_UT),
  fom: string().when("utfallRegistreringUnntak", {
    is: MKV.Koder.utfallregistreringunntak.DELVIS_GODKJENT,
    then: string().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tom: string().when("utfallRegistreringUnntak", {
    is: MKV.Koder.utfallregistreringunntak.DELVIS_GODKJENT,
    then: string().erGyldigDato().erEtterDatofelt("fom", TIDLIGERE_ENN_FOM).required(MAA_FYLLES_UT),
  }),
  bestemmelse: string().when("utfallRegistreringUnntak", {
    is: (utfall) =>
      utfall === MKV.Koder.utfallregistreringunntak.GODKJENT ||
      utfall === MKV.Koder.utfallregistreringunntak.DELVIS_GODKJENT,
    then: string().required(MAA_FYLLES_UT),
  }),
  trygdedekning: string().when("bestemmelse", {
    is: (bestemmelse) => bestemmelse === CAN_ART11 || bestemmelse === USA_ART5_9,
    then: string().required(MAA_FYLLES_UT),
  }),
});

export default vurdering_unntak_medlemskap;
