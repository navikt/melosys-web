import { array, lazy, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";
import { erIPeriode, formatterDatoTilISO } from "../../../../../utils/dato";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const {
  NÆRINGSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  FN_SKATTEFRITAK,
  MISJONÆR,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
} = MKV.Koder.inntektskildetype;
const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medl.periode" };

export const arbAvgBetalesKreves = (kildetype, medlemskapsTypeErPliktig) =>
  !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.avg. betales når det kreves",
  message: { message: "Velg om arb.avg. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    return !(
      arbAvgBetalesKreves(kildetype, schema?.options?.context?.medlemskapsTypeErPliktig) &&
      Utils._isEmpty(arbAvgBetales)
    );
  },
};

export const erBrukerSkattepliktigIHelePerioden = (skatteforholdsperioder) => {
  return !skatteforholdsperioder.some((skatteforhold) => skatteforhold.skatteplikttype === IKKE_SKATTEPLIKTIG);
};

export const bruttoInntektKreves = (brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) =>
  !brukerSkattepliktigIHelePerioden ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK, PENSJON_UFØRETRYGD].includes(kildetype) ||
  ([INNTEKT_FRA_UTLANDET, PENSJON_UFØRETRYGD_KILDESKATT].includes(kildetype) && arbAvgBetales === BOOLSK_STRING.USANN);

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: { message: "Fyll inn brutto inntekt" },
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
  message: { melding: "Sluttdato mangler" },
  test: (tomDato) => {
    return !Utils._isEmpty(tomDato);
  },
};

const datoErInnenforAarTest = {
  name: "Åpen sluttdato ved etterfølgende perioder og periode innenfor året",
  message: {
    melding: `Periode utenfor valgt år`,
  },
  test: (dato, schema) => {
    if (dato === "") return true;
    const år = schema?.options?.context?.valgtår;
    const isoDato = formatterDatoTilISO(dato);
    return erIPeriode(new Date(år, 0, 1), new Date(år, 11, 31, 23, 59, 59, 999), isoDato, true);
  },
};

const aarsavregningUtenGrunnlagSchema = object().shape({
  medlemskapsperioder: array()
    .min(1, "Minst en medlemskapsperiode")
    .of(
      object().shape({
        fomDato: string().erGyldigDato().test(datoErInnenforAarTest).required(),
        tomDato: string().erGyldigDato().erEtterDatofelt("fomDato").test(åpenTomTest).test(datoErInnenforAarTest),
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
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .test(datoErInnenforAarTest)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .erEtterDatofelt("fomDato")
          .test(datoErInnenforAarTest)
          .required(MAA_FYLLES_UT),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      }),
    ),
  inntektskilder: array()
    .min(1, "Minst en inntektskilde")
    .of(
      object().shape({
        kildetype: string().required(MAA_FYLLES_UT),
        arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
        bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
        fomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .test(datoErInnenforAarTest)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .erEtterDatofelt("fomDato")
          .test(datoErInnenforAarTest)
          .required(MAA_FYLLES_UT),
      }),
    ),
});

export default aarsavregningUtenGrunnlagSchema;
