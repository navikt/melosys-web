import { object, string, bool, array } from "yup";
import * as KV from "../../../../kodeverk";

const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottakerinstitusjon kreves" };
const LOVVALGSLAND_KREVES = { melding: "Lovvalgsland kreves" };
const OPPGI_ET_LAND = { melding: "Oppgi et land." };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const artikkel13_utpek = object().shape({
  forkortUtpekingsperiode: bool().required(),
  fomDato: string().when("forkortUtpekingsperiode", {
    is: true,
    then: string().erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortUtpekingsperiode", {
    is: true,
    then: string().erInnenforSoknadsperioden().erEtterDatofelt("fomDato").erGyldigDato().required(MAA_FYLLES_UT),
  }),
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjoner: array().of(
    object().shape({
      kreverMottakerinstitusjon: bool(),
      id: string().when("kreverMottakerinstitusjon", {
        is: true,
        then: string().required(MOTTAKERINSTITUSJON_KREVES),
      }),
    }),
  ),
  lovvalgsland: string().when("$validerLovvalgsland", {
    is: true,
    then: string().erLandKode(OPPGI_ET_LAND).required(LOVVALGSLAND_KREVES),
  }),
});

export default artikkel13_utpek;
