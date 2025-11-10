import { object, string, bool, array } from "yup";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";

const VELG_EN_BESTEMMELSE = "Velg en bestemmelse.";
const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottakerinstitusjon kreves" };
const VELG_OM_UTENLANDSK_TRYGDEMYNDIGHET_SKAL_INFORMERES = {
  melding: "Velg om utenlandsk trygdemyndighet skal informeres",
};
const VELG_LAND = { melding: "Velg land" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const arbeid_tjenesteperson_eller_fly_vedtak = object().shape({
  lovvalgsbestemmelse: string().nullable().required(VELG_EN_BESTEMMELSE),
  forkortLovvalgsperiode: bool().required(),
  fomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: (schema) => schema.erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: (schema) =>
      schema.erInnenforSoknadsperioden().erEtterDatofelt("fomDato").erGyldigDato().required(MAA_FYLLES_UT),
  }),
  vedtakstype: string()
    .nullable()
    .when("$behandlingstype", {
      is: (behandlingstype) => behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      then: (schema) => schema.required(VELG_EN_VEDTAKSTYPE),
    }),
  vedtakstypebegrunnelse: string()
    .nullable()
    .when("$behandlingstype", {
      is: (behandlingstype) => behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      then: (schema) => schema.required(OPPGI_BEGRUNNELSE),
    }),
  mottakerinstitusjoner: array().of(
    object().shape({
      kreverMottakerinstitusjon: bool(),
      id: string().when("kreverMottakerinstitusjon", {
        is: true,
        then: (schema) => schema.required(MOTTAKERINSTITUSJON_KREVES),
      }),
    }),
  ),
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: (schema) => schema.required(MOTTAKERINSTITUSJON_KREVES),
  }),
  informerUtenlandskTrygdemyndighet: bool().nullable().required(VELG_OM_UTENLANDSK_TRYGDEMYNDIGHET_SKAL_INFORMERES),
  mottakerLand: string().when("informerUtenlandskTrygdemyndighet", {
    is: true,
    then: (schema) => schema.required(VELG_LAND),
  }),
});

export default arbeid_tjenesteperson_eller_fly_vedtak;
