import { object, string, bool } from "yup";

import * as KV from "../../../../kodeverk";

const VELG_EN_BESTEMMELSE = "Velg en bestemmelse.";
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurderingPeriodeSchema = object().shape({
  lovvalgsbestemmelse: string().nullable().required(VELG_EN_BESTEMMELSE),
  forkortLovvalgsperiode: bool().required(),
  fomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    // Custom yup-utvidelser (erInnenforSoknadsperioden, erGyldigDato) finnes ikke i StringSchema-typen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (schema: any) => schema.required(MAA_FYLLES_UT).erGyldigDato().erInnenforSoknadsperioden(),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    // Custom yup-utvidelser (erInnenforSoknadsperioden, erEtterDatofelt, erGyldigDato) finnes ikke i StringSchema-typen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (schema: any) =>
      schema.required(MAA_FYLLES_UT).erGyldigDato().erEtterDatofelt("fomDato").erInnenforSoknadsperioden(),
  }),
});

export default vurderingPeriodeSchema;
