import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT, TIDLIGERE_ENN_FOM } = KV.Feilmeldinger;
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge arbeidsland" };

const vurdering_inngang = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom", TIDLIGERE_ENN_FOM).nullable(),
  arbeidsland: string().required(ARBEIDSLAND_FELT_KREVES),
});

export default vurdering_inngang;
