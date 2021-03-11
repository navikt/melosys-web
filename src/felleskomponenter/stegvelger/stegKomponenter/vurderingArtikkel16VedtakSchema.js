import { object, string, bool } from "yup";

import MKV from "../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const SKRIV_INN_GYLDIG_DATO = { melding: "Skriv inn en gyldig dato" };
const MAA_FYLLES_UT = { melding: "Må fylles ut" };
const UGYLDIG_PERIODE = { melding: "Ugyldig periode" };

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
  fomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string().endretPeriodeErGyldig(UGYLDIG_PERIODE).erGyldigDato(SKRIV_INN_GYLDIG_DATO).required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string().endretPeriodeErGyldig(UGYLDIG_PERIODE).erGyldigDato(SKRIV_INN_GYLDIG_DATO).required(MAA_FYLLES_UT),
  }),
});

export default artikkel16_vedtak;
