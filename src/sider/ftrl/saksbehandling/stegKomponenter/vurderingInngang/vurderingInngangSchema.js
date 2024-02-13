import { array, boolean, object, string } from "yup";
import * as KV from "../../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge arbeidsland" };
const LAND_FELT_KREVES = { melding: "Du må velge land" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const vurdering_inngang = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
  arbeidsland: string().when("$erIkkeYrkesaktiv", {
    is: false,
    then: string().required(ARBEIDSLAND_FELT_KREVES),
    otherwise: string().nullable(),
  }),
  land: array().when(["$erIkkeYrkesaktiv", "flereLandUkjentHvilke"], {
    is: (erIkkeYrkesaktiv, flereLandUkjentHvilke) => erIkkeYrkesaktiv && !flereLandUkjentHvilke,
    then: array().of(string()).min(1, LAND_FELT_KREVES).required(LAND_FELT_KREVES),
    otherwise: array().nullable(),
  }),
  flereLandUkjentHvilke: boolean().when("$erIkkeYrkesaktiv", {
    is: true,
    then: boolean().required(LAND_FELT_KREVES),
    otherwise: boolean().nullable(),
  }),
  trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES).nullable(),
  inkluderSiste5Aar: boolean().nullable(),
});

export default vurdering_inngang;
