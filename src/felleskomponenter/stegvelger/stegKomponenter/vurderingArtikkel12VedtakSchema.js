import { object, string, bool } from "yup";

import * as MKV from "@navikt/melosys-kodeverk";
import { DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN } from "../../../kodeverk/feilmeldinger";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottakerinstitusjon kreves" };

const artikkel12_vedtak = object().shape({
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
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: string().required(MOTTAKERINSTITUSJON_KREVES),
  }),
  fritekstSed: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
});

export default artikkel12_vedtak;
