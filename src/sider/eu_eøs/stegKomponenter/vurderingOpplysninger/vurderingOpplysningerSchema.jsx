import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_opplysninger = object().shape({
  fomDato: string().erGyldigDato().required(MAA_FYLLES_UT),
  tomDato: string().erGyldigDato().required(MAA_FYLLES_UT),
  bostedsland: string().required(),
});

export default vurdering_opplysninger;
