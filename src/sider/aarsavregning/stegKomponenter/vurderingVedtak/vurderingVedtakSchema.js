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
    .nullable()
    .max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN)
    .when([], {
      is: () => true,
      then: (schema) =>
        schema.test({
          name: "begrunnelse-required-manuell",
          message: DU_MAA_OPPGI_BEGRUNNELSE_FOR_ENDELIG_TRYGDEAVGIFT,
          test(value) {
            const { endeligAvgiftValg } = this.options.context || {};
            if (endeligAvgiftValg === MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT) {
              return !!value; // Required if MANUELL_ENDELIG_AVGIFT
            }
            return true;
          },
        }),
      otherwise: (schema) => schema.nullable(),
    }),
  innledningFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurdering_vedtak;
