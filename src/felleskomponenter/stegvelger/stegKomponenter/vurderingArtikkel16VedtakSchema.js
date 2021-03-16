import { object, string, bool } from "yup";

import * as Utils from "../../../utils";
import * as KV from "../../../kodeverk";

import MKV from "../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };
const SKRIV_INN_GYLDIG_DATO = { melding: "Skriv inn en gyldig dato" };
const MAA_FYLLES_UT = { melding: "Må fylles ut" };

const {
  TIDLIGERE_ENN_OPPRINNELIG_FOM,
  SENERE_ENN_OPPRINNELIG_TOM,
  TIDLIGERE_ENN_FOM,
  SENERE_ENN_TOM,
} = KV.Feilmeldinger;

// const erPeriodeGyldig = (value, { options }) => {
//   const { lovvalgsperiode } = options.context;

//   return Utils.dato.erIPeriode(lovvalgsperiode.fomDato, lovvalgsperiode.tomDato, Utils.dato.formatterDatoTilISO(value), "[]");
// };

// const gyldigPeriodeTest = {
//   name: "Gyldig periode",
//   message: UGYLDIG_PERIODE,
//   test: erPeriodeGyldig,
// };

const erEtterOpprinneligFomTest = {
  name: "erEtterOpprinneligFom",
  message: TIDLIGERE_ENN_OPPRINNELIG_FOM,
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(Utils.dato.formatterDatoTilISO(value), options.context.lovvalgsperiode.fomDato, "days") >=
    0,
};

const erFoerOpprinneligTomTest = {
  name: "erFørOpprinneligTom",
  message: SENERE_ENN_OPPRINNELIG_TOM,
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(Utils.dato.formatterDatoTilISO(value), options.context.lovvalgsperiode.tomDato, "days") <=
    0,
};

const erFoerTomTest = {
  name: "erFoerTom",
  message: SENERE_ENN_TOM,
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(
      Utils.dato.formatterDatoTilISO(value),
      Utils.dato.formatterDatoTilISO(options.parent.tomDato),
      "days"
    ) <= 0,
};

const erEtterFomTest = {
  name: "erEtterFom",
  message: TIDLIGERE_ENN_FOM,
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(
      Utils.dato.formatterDatoTilISO(value),
      Utils.dato.formatterDatoTilISO(options.parent.fomDato),
      "days"
    ) >= 0,
};

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
    then: string()
      .test(erEtterOpprinneligFomTest)
      .test(erFoerOpprinneligTomTest)
      .test(erFoerTomTest)
      .erGyldigDato(SKRIV_INN_GYLDIG_DATO)
      .required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: string()
      .test(erEtterOpprinneligFomTest)
      .test(erFoerOpprinneligTomTest)
      .test(erEtterFomTest)
      .erGyldigDato(SKRIV_INN_GYLDIG_DATO)
      .required(MAA_FYLLES_UT),
  }),
});

export default artikkel16_vedtak;
