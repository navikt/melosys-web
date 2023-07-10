import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_start = () =>
  object().shape({
    fom: string().erGyldigDato().required(MAA_FYLLES_UT),
    tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
  });

export default vurdering_start;
