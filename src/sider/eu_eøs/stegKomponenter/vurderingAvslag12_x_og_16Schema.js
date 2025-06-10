import { object, string } from "yup";

import MKV from "../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };

const avslag_artikkel_12_og_16 = object().shape({
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
});

export default avslag_artikkel_12_og_16;
