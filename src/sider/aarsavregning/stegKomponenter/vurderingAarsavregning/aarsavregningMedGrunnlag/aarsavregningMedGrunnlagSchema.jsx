import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import * as Datoutils from "../../../../../utils/dato";

import { erBrukerSkattepliktigIHelePerioden } from "../utils";
import { BOOLSK_STRING } from "../../../../../constants";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const {
  NÆRINGSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  FN_SKATTEFRITAK,
  MISJONÆR,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
} = MKV.Koder.inntektskildetype;
const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT, OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET } =
  MKV.Koder.endeligAvgiftValg;
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medl.periode" };
const UTENFOR_HELSEUTGIFTDEKKESPERIODEN = { melding: "Utenfor periode Norge dekker helseutgifter" };

const erGyldigOgKunTall = (datoString) => {
  const datoUtenSkilletegn = datoString.replace(/[-./]/g, "");
  if (!/^\d+$/.test(datoUtenSkilletegn)) {
    return false;
  }
  return Boolean(Utils.dato.vaskInputDato(datoString));
};

const erInnenforValgtAarTest = {
  name: "Utenfor valgt år",
  message: {
    melding: `Utenfor valgt år`,
  },
  test: (datoString, schema) => {
    const aar = schema?.options?.context?.aar;
    if (!datoString) return false;
    if (!erGyldigOgKunTall(datoString)) return true;
    const dato = new Date(Datoutils.vaskOgFormatterTilISO(datoString));
    const startAar = new Date(aar, 0, 1);
    const sluttAar = new Date(aar, 11, 31, 23, 59, 59, 999);
    return dato >= startAar && dato <= sluttAar;
  },
};

const åpenTomTest = {
  name: "Åpen sluttdato",
  message: { melding: "Sluttdato mangler" },
  test: (tomDato) => {
    return !Utils._isEmpty(tomDato);
  },
};

const medlemskapsperiodeSchema = object().shape({
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforValgtAarTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .erEtterDatofelt("fomDato")
    .test(åpenTomTest)
    .test(erInnenforValgtAarTest),
  trygdedekning: string().when("type", {
    is: (type) => type === "HELSEUTGIFTDEKKESPERIODE",
    then: (schema) => schema.nullable().notRequired(),
    otherwise: (schema) => schema.required(MAA_FYLLES_UT),
  }),
  bostedLandkode: string().when("type", {
    is: (type) => type === "HELSEUTGIFTDEKKESPERIODE",
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
});

export const arbAvgBetalesKreves = (kildetype, medlemskapsTypeErPliktig) =>
  !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: { melding: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    if (!arbAvgBetalesKreves(kildetype, schema?.options?.context?.medlemskapsTypeErPliktig)) {
      return true;
    }

    return !Utils._isEmpty(arbAvgBetales);
  },
};

const bruttoInntektKreves = (brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) =>
  !brukerSkattepliktigIHelePerioden ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK, PENSJON_UFØRETRYGD].includes(kildetype) ||
  ([INNTEKT_FRA_UTLANDET, PENSJON_UFØRETRYGD_KILDESKATT].includes(kildetype) && arbAvgBetales === BOOLSK_STRING.USANN);

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: MAA_FYLLES_UT,
  test: (bruttoInntekt, schema) => {
    const { skatteforholdsperioder } = schema.from[1].value;
    const { kildetype, arbAvgBetales } = schema.from[0].value;

    const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);
    if (!bruttoInntektKreves(brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales)) {
      return true;
    }
    return !Utils._isEmpty(bruttoInntekt);
  },
};

const erInnenforAvgiftspliktigperiodeTest = {
  name: "erInnenforAvgiftspliktigperiode",
  test: function (datoString, schema) {
    if (!datoString) return true;

    try {
      const { erHelseutgiftDekkesPeriode } = schema.options.context;
      const parentFormValues = schema.from[1]?.value;

      // When periods are editable (from avgiftssystemet), read from form values
      if (
        parentFormValues?.endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET &&
        parentFormValues?.avgiftspliktigperioder?.length > 0
      ) {
        const vasketDato = Utils.dato.vaskInputDato(datoString);
        if (!vasketDato || vasketDato.length < 10) return true;

        const gyldigePerioder = parentFormValues.avgiftspliktigperioder.filter((p) => p.fomDato && p.tomDato);
        if (gyldigePerioder.length === 0) return true;

        const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);
        const fom = sortertePerioder[0].fomDato;
        const tom = sortertePerioder[sortertePerioder.length - 1].tomDato;

        const erInnenfor = Utils.dato.erIPeriode(
          Utils.dato.vaskOgFormatterTilISO(fom),
          Utils.dato.vaskOgFormatterTilISO(tom),
          Utils.dato.vaskOgFormatterTilISO(datoString),
          "[]",
        );

        if (!erInnenfor) {
          return this.createError({
            message: erHelseutgiftDekkesPeriode ? UTENFOR_HELSEUTGIFTDEKKESPERIODEN : UTENFOR_MEDLEMSKAPSPERIODEN,
          });
        }
        return true;
      }

      // Original behavior: read from context (computed avgiftspliktigperiode)
      const { avgiftspliktigperiode } = schema.options.context;

      const avgiftspliktigperiodeFom = Utils.dato.formatterDatoTilISO(avgiftspliktigperiode.fomDato);
      const avgiftspliktigperiodeTom = Utils.dato.formatterDatoTilISO(avgiftspliktigperiode.tomDato);
      const isoDatoString = Utils.dato.formatterDatoTilISO(datoString);

      if (!isoDatoString) return false;

      const erInnenfor = isoDatoString >= avgiftspliktigperiodeFom && isoDatoString <= avgiftspliktigperiodeTom;

      if (!erInnenfor) {
        return this.createError({
          message: erHelseutgiftDekkesPeriode ? UTENFOR_HELSEUTGIFTDEKKESPERIODEN : UTENFOR_MEDLEMSKAPSPERIODEN,
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  },
};

const skatteforholdsperiodeSchema = object().shape({
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforAvgiftspliktigperiodeTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .erEtterDatofelt("fomDato")
    .test(erInnenforAvgiftspliktigperiodeTest),
  skatteplikttype: string().required(MAA_FYLLES_UT),
});

const inntektskildeSchema = object().shape({
  kildetype: string().required(MAA_FYLLES_UT),
  arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
  bruttoInntekt: string().test(bruttoInntektFyltUtNårDetKrevesTest),
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforAvgiftspliktigperiodeTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .erEtterDatofelt("fomDato")
    .test(erInnenforAvgiftspliktigperiodeTest),
  erMaanedsbelop: string(),
});

const aarsavregningMedGrunnlagSchema = object().shape({
  endeligAvgiftValg: string().required(MAA_FYLLES_UT),
  avgiftspliktigperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET,
    then: (schema) => schema.min(1, "Minst en medlemskapsperiode").of(medlemskapsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  skatteforholdsperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) =>
      endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
      endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET,
    then: (schema) => schema.min(1, "Minst en skatteforholdsperiode").of(skatteforholdsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  inntektskilder: array().when(["$medlemskapsTypeErPliktig", "endeligAvgiftValg", "skatteforholdsperioder"], {
    is: (medlemskapsTypeErPliktig, endeligAvgiftValg, skatteforholdsperioder) => {
      return (
        (endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
          endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) &&
        (!medlemskapsTypeErPliktig || !erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder))
      );
    },
    then: (schema) => schema.min(1, "Minst en inntektskilde").of(inntektskildeSchema),
    otherwise: (schema) => schema,
  }),
  manueltAvgiftBeloep: string().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT,
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default aarsavregningMedGrunnlagSchema;
