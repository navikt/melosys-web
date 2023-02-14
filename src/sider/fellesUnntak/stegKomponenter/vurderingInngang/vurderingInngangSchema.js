import { object, string } from "yup";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT, TIDLIGERE_ENN_FOM } = KV.Feilmeldinger;
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge avsenderland" };
const LOVVALGSLAND_FELT_KREVES = { melding: "Du må velge lovvalgsland" };

const vurdering_inngang = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom", TIDLIGERE_ENN_FOM).nullable(),
  avsenderland: string().required(ARBEIDSLAND_FELT_KREVES),
  lovvalgsland: string().when("$sakstype", {
    is: MKV.Koder.sakstyper.EU_EOS,
    then: string().required(LOVVALGSLAND_FELT_KREVES),
  }),
});

export default vurdering_inngang;
