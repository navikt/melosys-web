import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import { VurderingUtfall } from "./vurderingBestemmelse";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_bestemmelse = object().shape({
  vurderingUtfall: string().required(MAA_FYLLES_UT),
  bestemmelse: string().when("vurderingUtfall", {
    is: (vurderingUtfall) => vurderingUtfall === VurderingUtfall.INNVILGELSE,
    then: string().required(MAA_FYLLES_UT),
  }),
  ikkeYrkesaktivSituasjontype: string()
    .nullable()
    .when("bestemmelse", {
      is: (bestemmelse) =>
        bestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E,
      then: string().required(MAA_FYLLES_UT),
    }),
});
export default vurdering_bestemmelse;
