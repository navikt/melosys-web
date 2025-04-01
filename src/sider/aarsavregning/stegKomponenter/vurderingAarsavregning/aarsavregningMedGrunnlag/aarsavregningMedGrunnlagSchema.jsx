import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";

import { erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const {
  NÆRINGSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  FN_SKATTEFRITAK,
  MISJONÆR,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
} = MKV.Koder.inntektskildetype;
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medl.periode" };

export const arbAvgBetalesKreves = (kildetype, medlemskapsTypeErPliktig) =>
  !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: "Velg om arb.ag. betales til skatt",
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

const erInnenforMedlemskapsperiodeTest = {
  name: "erInnenforMedlemskapsperiode",
  message: UTENFOR_MEDLEMSKAPSPERIODEN,
  test: (datoString, schema) => {
    if (Utils._isEmpty(datoString) || !Utils.dato.vaskInputDato(datoString)) return true;

    try {
      const { medlemskapsperiode } = schema.options.context;
      if (!medlemskapsperiode || !medlemskapsperiode.fomDato || !medlemskapsperiode.tomDato) return true;

      const membershipStart = Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato);
      const membershipEnd = Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato);
      const dateToCheck = Utils.dato.formatterDatoTilISO(datoString);

      if (!membershipStart || !membershipEnd || !dateToCheck) return true;

      // Use direct comparison rather than moment.isBetween to avoid potential edge cases
      return dateToCheck >= membershipStart && dateToCheck <= membershipEnd;
    } catch (error) {
      return true;
    }
  },
};

const skatteforholdsperiodeSchema = object().shape({
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforMedlemskapsperiodeTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .erEtterDatofelt("fomDato")
    .test(erInnenforMedlemskapsperiodeTest),
  skatteplikttype: string().required(MAA_FYLLES_UT),
});

const inntektskildeSchema = object().shape({
  kildetype: string().required(MAA_FYLLES_UT),
  arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
  bruttoInntekt: string().test(bruttoInntektFyltUtNårDetKrevesTest),
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforMedlemskapsperiodeTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .erEtterDatofelt("fomDato")
    .test(erInnenforMedlemskapsperiodeTest),
  erMaanedsbelop: string(),
});

const aarsavregningMedGrunnlagSchema = object().shape({
  erAvvik: string().required(MAA_FYLLES_UT),
  skatteforholdsperioder: array().when(["erAvvik"], {
    is: (erAvvik) => erAvvik === BOOLSK_STRING.SANN,
    then: array().min(1, "Minst en skatteforholdsperiode").of(skatteforholdsperiodeSchema),
    otherwise: array(),
  }),
  inntektskilder: array().when(["$medlemskapsTypeErPliktig", "erAvvik", "skatteforholdsperioder"], {
    is: (medlemskapsTypeErPliktig, erAvvik, skatteforholdsperioder) => {
      return erAvvik === BOOLSK_STRING.SANN && (!medlemskapsTypeErPliktig || !erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder));
    },
    then: array().min(1, "Minst en inntektskilde").of(inntektskildeSchema),
    otherwise: array(),
  }),
});

export default aarsavregningMedGrunnlagSchema;
