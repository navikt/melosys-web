import { object, string, bool, array } from "yup";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import {
  DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN,
  DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN,
} from "../../../../kodeverk/feilmeldinger";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottakerinstitusjon kreves" };
const VELG_OM_UTENLANDSK_TRYGDEMYNDIGHET_SKAL_INFORMERES = {
  melding: "Velg om utenlandsk trygdemyndighet skal informeres",
};
const VELG_LAND = { melding: "Velg land" };

const arbeid_tjenesteperson_eller_fly_vedtak = object().shape({
  // Lovvalgsbestemmelse og periode valideres nå i periode-steget
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
  vedtaksbrevFritekst: string().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN).nullable(),
  fritekstSed: string().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN).nullable(),
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
