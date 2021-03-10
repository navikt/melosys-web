import { object, string, bool } from "yup";

import MKV from "../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };

const artikkel16_vedtak = object().shape({
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
  forkortLovvalgsperiode: bool().required(),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string()
      .endretPeriodeErGyldig({ melding: "Ugyldig periode" })
      .erGyldigDato({ melding: "Gyldig dato kreves" })
      .required({ melding: "Dato kreves" }),
  }),
});

export default artikkel16_vedtak;
