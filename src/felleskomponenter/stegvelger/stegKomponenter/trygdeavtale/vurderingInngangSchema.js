import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge arbeidsland" };

const vurdering_inngang = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
  land: string().required(ARBEIDSLAND_FELT_KREVES),
});

export default vurdering_inngang;
