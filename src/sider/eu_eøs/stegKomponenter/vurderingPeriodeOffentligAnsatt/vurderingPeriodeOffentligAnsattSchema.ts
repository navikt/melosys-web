import { object, string, bool } from "yup";

import * as KV from "../../../../kodeverk";

const VELG_EN_BESTEMMELSE = "Velg en bestemmelse.";
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurderingPeriodeOffentligAnsattSchema = object().shape({
  lovvalgsbestemmelse: string().nullable().required(VELG_EN_BESTEMMELSE),
  forkortLovvalgsperiode: bool().required(),
  fomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (schema: any) => schema.erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (schema: any) =>
      schema.erInnenforSoknadsperioden().erEtterDatofelt("fomDato").erGyldigDato().required(MAA_FYLLES_UT),
  }),
});

export default vurderingPeriodeOffentligAnsattSchema;
