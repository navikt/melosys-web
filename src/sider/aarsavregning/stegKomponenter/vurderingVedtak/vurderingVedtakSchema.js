// noinspection ES6PreferShortImport

import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;
export const DU_MAA_OPPGI_BEGRUNNELSE_FOR_ENDELIG_TRYGDEAVGIFT = {
  melding: 'Du må oppgi en begrunnelse for "Endelig trygdeavgift"',
};

const vurdering_vedtak = object().shape({
  // behandlingsvalg is no longer part of form values, accessed via context
  begrunnelseFritekst: string()
    .nullable()
    .max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN)
    .when([], {
      is: () => true, // Always run the check
      then: (schema) =>
        schema.test({
          name: "begrunnelse-required-manuell",
          message: DU_MAA_OPPGI_BEGRUNNELSE_FOR_ENDELIG_TRYGDEAVGIFT,
          test(value) {
            const { behandlingsvalg } = this.options.context || {};
            if (behandlingsvalg === MKV.Koder.aarsavregningBehandlingsvalg.MANUELL_ENDELIG_AVGIFT) {
              return !!value; // Required if MANUELL_ENDELIG_AVGIFT
            }
            return true; // Optional otherwise
          },
        }),
      otherwise: (schema) => schema.nullable(),
    }),
  innledningFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurdering_vedtak;
