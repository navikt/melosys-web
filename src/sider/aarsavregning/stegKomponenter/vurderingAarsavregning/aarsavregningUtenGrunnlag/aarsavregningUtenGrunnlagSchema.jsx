import { array, lazy, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";
import * as Datoutils from "../../../../../utils/dato";

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

    return !(
      arbAvgBetalesKreves(kildetype, schema?.options?.context?.medlemskapsTypeErPliktig) &&
      Utils._isEmpty(arbAvgBetales)
    );
  },
};

const erInnenforValgtAarTest = {
  name: "Utenfor valgt år",
  message: {
    melding: `Utenfor valgt år`,
  },
  test: (datoString, schema) => {
    const aar = schema?.options?.context?.aar;
    if (!datoString) return false;
    const dato = new Date(Datoutils.formatterDatoTilISO(datoString));
    const startAar = new Date(aar, 0, 1);
    const sluttAar = new Date(aar, 11, 31, 23, 59, 59, 999);
    return dato >= startAar && dato <= sluttAar;
  },
};

export const bruttoInntektKreves = (brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) =>
  !brukerSkattepliktigIHelePerioden ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK, PENSJON_UFØRETRYGD].includes(kildetype) ||
  ([INNTEKT_FRA_UTLANDET, PENSJON_UFØRETRYGD_KILDESKATT].includes(kildetype) && arbAvgBetales === BOOLSK_STRING.USANN);

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: "Fyll inn brutto inntekt",
  test: (bruttoInntekt, schema) => {
    const { skatteforholdsperioder } = schema.from[1].value;
    const { kildetype, arbAvgBetales } = schema.from[0].value;

    const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);

    return !(
      bruttoInntektKreves(brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) && Utils._isEmpty(bruttoInntekt)
    );
  },
};

const åpenTomTest = {
  name: "Åpen sluttdato",
  message: "Sluttdato mangler",
  test: (tomDato) => {
    return !Utils._isEmpty(tomDato);
  },
};

const aarsavregningUtenGrunnlagSchema = object().shape({
  medlemskapsperioder: array()
    .min(1, "Minst en medlemskapsperiode")
    .of(
      object().shape({
        fomDato: string().erGyldigDato().test(erInnenforValgtAarTest).required(),
        tomDato: string().erGyldigDato().erEtterDatofelt("fomDato").test(åpenTomTest).test(erInnenforValgtAarTest),
        trygdedekning: string().required(),
        bestemmelse: string().required(),
      }),
    ),
  skatteforholdsperioder: array()
    .min(1, "Minst en skatteforholdsperiode")
    .of(
      object().shape({
        fomDato: string()
          .erGyldigDato()
          .test(erInnenforValgtAarTest)
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .test(erInnenforValgtAarTest)
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .erEtterDatofelt("fomDato")
          .test(åpenTomTest)
          .required(MAA_FYLLES_UT),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      }),
    ),
  inntektskilder: array()
    .min(1, "Minst en inntektskilde")
    .of(
      object().shape({
        fomDato: string().defined(MAA_FYLLES_UT).erGyldigDato().test(erInnenforValgtAarTest).required(),
        tomDato: string()
          .defined(MAA_FYLLES_UT)
          .erGyldigDato()
          .erEtterDatofelt("fomDato")
          .test(åpenTomTest)
          .test(erInnenforValgtAarTest)
          .required(),
        kildetype: string().required(MAA_FYLLES_UT),
        arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
        bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
      }),
    ),
});

export default aarsavregningUtenGrunnlagSchema;
