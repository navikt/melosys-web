import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_bestemmelse = object().shape({
  vedtak: string().required(MAA_FYLLES_UT),
  innvilgelse: string().required(MAA_FYLLES_UT),
  bestemmelse: string().required(MAA_FYLLES_UT),
});

export default vurdering_bestemmelse;
