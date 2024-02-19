import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
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
const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medlemskapsperioden" };

export const arbAvgBetalesKreves = (kildetype) => kildetype !== MISJONÆR;

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.avg. betales når det kreves",
  message: { message: "Velg om arb.avg. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    return !(arbAvgBetalesKreves(kildetype) && Utils._isEmpty(arbAvgBetales));
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

const vurdering_trygdeavgift = object().shape({
  skatteforholdsperioder: array()
    .of(
      object().shape({
        fomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .erEtterDatofelt("fomDato")
          .required(MAA_FYLLES_UT),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      })
    )
    .min(1),
  inntektskilder: array()
    .of(
      object().shape({
        kildetype: string().required(MAA_FYLLES_UT),
        arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
        bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
        fomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
          .erEtterDatofelt("fomDato")
          .required(MAA_FYLLES_UT),
      })
    )
    .min(1),
});

export default vurdering_trygdeavgift;
