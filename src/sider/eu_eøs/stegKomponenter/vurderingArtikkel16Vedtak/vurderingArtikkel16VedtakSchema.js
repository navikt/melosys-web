import { object, string, bool } from "yup";

import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import { DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN } from "../../../../kodeverk/feilmeldinger";

import MKV from "../../../../melosyskodeverk";

const VELG_EN_VEDTAKSTYPE = { melding: "Velg en vedtakstype" };
const OPPGI_BEGRUNNELSE = { melding: "Oppgi begrunnelse" };

const { TIDLIGERE_ENN_OPPRINNELIG_FOM, SENERE_ENN_OPPRINNELIG_TOM, TIDLIGERE_ENN_FOM, SENERE_ENN_TOM, MAA_FYLLES_UT } =
  KV.Feilmeldinger;

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
      "days",
    ) <= 0,
};

const erEtterFomTest = {
  name: "erEtterFom",
  message: TIDLIGERE_ENN_FOM,
  test: (value, { options }) =>
    Utils.dato.datoDiffPure(
      Utils.dato.formatterDatoTilISO(value),
      Utils.dato.formatterDatoTilISO(options.parent.fomDato),
      "days",
    ) >= 0,
};

const artikkel16_vedtak = object().shape({
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
  forkortLovvalgsperiode: bool().required(),
  fomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: (schema) =>
      schema
        .test(erEtterOpprinneligFomTest)
        .test(erFoerOpprinneligTomTest)
        .test(erFoerTomTest)
        .erGyldigDato()
        .required(MAA_FYLLES_UT),
  }),
  tomDato: string().when("forkortLovvalgsperiode", {
    is: true,
    then: (schema) =>
      schema
        .test(erEtterOpprinneligFomTest)
        .test(erFoerOpprinneligTomTest)
        .test(erEtterFomTest)
        .erGyldigDato()
        .required(MAA_FYLLES_UT),
  }),
  vedtaksbrevFritekst: string().nullable().max(10000, DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN),
});

export default artikkel16_vedtak;
