import { string, object } from "yup";
import * as KV from "../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurder_utpeking = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").required(MAA_FYLLES_UT),
});

export default vurder_utpeking;
