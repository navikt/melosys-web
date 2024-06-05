import { array, boolean, object, string } from "yup";
import * as KV from "../../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const LAND_FELT_KREVES = { melding: "Du må velge land" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const vurdering_inngang = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
  land: array().when("flereLandUkjentHvilke", {
    is: false,
    then: array().of(string()).min(1, LAND_FELT_KREVES).required(LAND_FELT_KREVES),
    otherwise: array().nullable(),
  }),
  flereLandUkjentHvilke: boolean().required(LAND_FELT_KREVES),
  trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES).nullable(),
  inkluderSiste5Aar: boolean().nullable(),
});

export default vurdering_inngang;
