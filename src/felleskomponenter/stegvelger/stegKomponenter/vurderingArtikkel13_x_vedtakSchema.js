import { object, string, bool, array } from "yup";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottaker institusjon kreves" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const artikkel13_x_vedtak = object().shape({
  forkortLovvalgsperiode: bool().required(),
  fomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string().erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string().erInnenforSoknadsperioden().erEtterDatofelt("fomDato").erGyldigDato().required(MAA_FYLLES_UT),
  }),
  vedtakstype: string()
    .nullable()
    .when("$behandlingstype", {
      is: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      then: string().nullable().required(VELG_EN_VEDTAKSTYPE),
    }),
  vedtakstypebegrunnelse: string()
    .nullable()
    .when("$behandlingstype", {
      is: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      then: string().nullable().required(OPPGI_BEGRUNNELSE),
    }),
  mottakerinstitusjoner: array().of(
    object().shape({
      kreverMottakerinstitusjon: bool(),
      id: string().when("kreverMottakerinstitusjon", {
        is: true,
        then: string().required(MOTTAKERINSTITUSJON_KREVES),
      }),
    })
  ),
});

export default artikkel13_x_vedtak;
