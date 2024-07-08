import { bool, object, string } from "yup";

import * as MKV from "@navikt/melosys-kodeverk";
import {
  DU_KAN_IKKE_SKRIVE_MER_ENN_462_TEGN,
  DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN,
} from "../../../../kodeverk/feilmeldinger";
import { MKVUtils } from "../../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const MOTTAKERINSTITUSJON_KREVES = { melding: "Mottakerinstitusjon kreves" };

const vedtak = object().shape({
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
  fritekstSed: string().when("$bestemmelse", {
    is: MKVUtils.erStorbritanniaKonvBestemmelse,
    then: string().nullable().max(462, DU_KAN_IKKE_SKRIVE_MER_ENN_462_TEGN),
    otherwise: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
  }),
});

export default vedtak;
