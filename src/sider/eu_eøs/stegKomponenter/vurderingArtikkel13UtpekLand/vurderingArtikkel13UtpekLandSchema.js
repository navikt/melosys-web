import { object, string, bool, array } from "yup";
import * as KV from "../../../../kodeverk";
import { DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN } from "../../../../kodeverk/feilmeldinger";

const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottakerinstitusjon kreves" };
const LOVVALGSLAND_KREVES = { melding: "Lovvalgsland kreves" };
const OPPGI_ET_LAND = { melding: "Oppgi et land." };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const artikkel13_utpek = object().shape({
  forkortUtpekingsperiode: bool().required(),
  fomDato: string().when("forkortUtpekingsperiode", {
    is: true,
    then: (schema) => schema.erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortUtpekingsperiode", {
    is: true,
    then: (schema) =>
      schema.erInnenforSoknadsperioden().erEtterDatofelt("fomDato").erGyldigDato().required(MAA_FYLLES_UT),
  }),
  kreverMottakerinstitusjon: bool().required(),
  fritekstSed: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
  fritekstOrienteringsbrev: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
  mottakerinstitusjoner: array().of(
    object().shape({
      kreverMottakerinstitusjon: bool(),
      id: string().when("kreverMottakerinstitusjon", {
        is: true,
        then: (schema) => schema.required(MOTTAKERINSTITUSJON_KREVES),
      }),
    }),
  ),
  lovvalgsland: string().when("$validerLovvalgsland", {
    is: (validerLovvalgslandVal) => validerLovvalgslandVal === true,
    then: (schema) => schema.erLandKode(OPPGI_ET_LAND).required(LOVVALGSLAND_KREVES),
  }),
});

export default artikkel13_utpek;
