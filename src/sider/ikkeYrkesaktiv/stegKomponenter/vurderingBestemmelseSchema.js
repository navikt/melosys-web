import { object, string } from "yup";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_bestemmelse = object().shape({
  utfallRegistreringUnntak: string().required(MAA_FYLLES_UT),
  bestemmelse: string().when("utfall", {
    is: (utfall) => utfall === "GODKJENT",
    then: string().required(MAA_FYLLES_UT),
  }),
  brukersSituasjon: string().when("bestemmelse", {
    is: (bestemmelse) =>
      bestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E,
    then: string().required(MAA_FYLLES_UT),
  }),
});

export default vurdering_bestemmelse;
