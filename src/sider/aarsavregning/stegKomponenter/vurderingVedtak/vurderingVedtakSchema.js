import { boolean, object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;

export const DU_MAA_OPPGI_BEGRUNNELSE = {
  melding: "Du må oppgi en begrunnelse",
};

const vurdering_vedtak = object().shape({
  begrunnelseFritekst: string()
    .max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN)
    .when(["$endeligAvgiftValg", "$erNyVurdering"], {
      is: (endeligAvgiftValg, erNyVurdering) =>
        endeligAvgiftValg === MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT || erNyVurdering === true,
      then: (schema) => schema.required(DU_MAA_OPPGI_BEGRUNNELSE),
    }),
  innledningFritekst: string().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  skjoennsfastsattInntekt: boolean(),
});

export default vurdering_vedtak;
