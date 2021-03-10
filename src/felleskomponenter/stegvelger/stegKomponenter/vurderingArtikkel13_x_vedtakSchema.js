import { object, string, bool, array } from "yup";

import MKV from "../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottaker institusjon kreves" };

const artikkel13_x_vedtak = object().shape({
  forkortLovvalgsperiode: bool().required(),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string()
      .endretPeriodeErGyldig({ melding: "Ugyldig periode" })
      .erGyldigDato({ melding: "Gyldig dato kreves" })
      .required({ melding: "Dato kreves" }),
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
