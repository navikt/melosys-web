// noinspection ES6PreferShortImport

import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;
export const DU_MAA_OPPGI_BEGRUNNELSE_FOR_ENDELIG_TRYGDEAVGIFT = {
  melding: 'Du må oppgi en begrunnelse for "Endelig trygdeavgift"',
};

const vurdering_vedtak = object().shape({
  begrunnelseFritekst: string()
    .max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN)
    .when(["$endeligAvgiftValg"], {
      is: (endeligAvgiftValg) => endeligAvgiftValg === MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT,
      then: (schema) => schema.required(DU_MAA_OPPGI_BEGRUNNELSE_FOR_ENDELIG_TRYGDEAVGIFT),
    }),
  innledningFritekst: string().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurdering_vedtak;
