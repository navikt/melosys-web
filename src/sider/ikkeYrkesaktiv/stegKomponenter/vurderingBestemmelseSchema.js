import { object, string } from "yup";
import * as KV from "../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_bestemmelse = object().shape({
  utfall: string().required(MAA_FYLLES_UT),
  bestemmelse: string().when("utfall", {
    is: (utfall) => utfall === "INNVILGE",
    then: string().required(MAA_FYLLES_UT),
  }),
});

export default vurdering_bestemmelse;
