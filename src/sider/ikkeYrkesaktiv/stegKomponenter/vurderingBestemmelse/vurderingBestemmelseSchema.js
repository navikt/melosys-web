import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_bestemmelse = object().shape({
  innvilgelsesResultat: string().required(MAA_FYLLES_UT).oneOf([MKV.Koder.innvilgelsesResultat.INNVILGET], ""),
  bestemmelse: string().when("innvilgelsesResultat", {
    is: (innvilgelsesResultat) => innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET,
    then: (schema) => schema.required(MAA_FYLLES_UT),
  }),
  ikkeYrkesaktivSituasjontype: string()
    .nullable()
    .when("bestemmelse", {
      is: (bestemmelse) =>
        bestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E,
      then: (schema) => schema.required(MAA_FYLLES_UT),
    }),
});
export default vurdering_bestemmelse;
