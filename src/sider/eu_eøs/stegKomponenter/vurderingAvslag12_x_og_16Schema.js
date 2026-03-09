import { object, string } from "yup";

import MKV from "../../../melosyskodeverk";
import { DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN } from "../../../kodeverk/feilmeldinger";

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
  vedtaksbrevFritekst: string().nullable().max(10000, DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN),
});

export default avslag_artikkel_12_og_16;
