import { object, string, bool, array } from "yup";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import {
  DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN,
  DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN,
} from "../../../../kodeverk/feilmeldinger";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottaker institusjon kreves" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const artikkel13_x_vedtak = object().shape({
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
  vedtaksbrevFritekst: string().nullable().max(10000, DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN),
  fritekstSed: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
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
});

export default artikkel13_x_vedtak;
