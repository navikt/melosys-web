import { array, lazy, object, string } from "yup";
import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import { BOOLSK_STRING } from "../../../constants";

import { erBrukerSkattepliktigIHelePerioden } from "../../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const {
  NÆRINGSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  FN_SKATTEFRITAK,
  MISJONÆR,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
} = MKV.Koder.inntektskildetype;
const UTENFOR_HELSEUTGIFT_DEKKES_PERIODE = { melding: "Utenfor helseutgift dekkes periode" };

export const arbAvgBetalesKreves = (kildetype: any) => kildetype !== MISJONÆR;

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: { message: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales: any, schema: any) => {
    const { kildetype } = schema.from[0].value;

    return !(arbAvgBetalesKreves(kildetype) && Utils._isEmpty(arbAvgBetales));
  },
};

export const bruttoInntektKreves = (brukerSkattepliktigIHelePerioden: any, kildetype: any, arbAvgBetales: any) =>
  !brukerSkattepliktigIHelePerioden ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK, PENSJON_UFØRETRYGD].includes(kildetype) ||
  ([INNTEKT_FRA_UTLANDET, PENSJON_UFØRETRYGD_KILDESKATT].includes(kildetype) && arbAvgBetales === BOOLSK_STRING.USANN);

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: { message: "Fyll inn brutto inntekt" },
  test: (bruttoInntekt: any, schema: any) => {
    const { skatteforholdsperioder } = schema.from[1].value;
    const { kildetype, arbAvgBetales } = schema.from[0].value;

    const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);

    return !(
      bruttoInntektKreves(brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) && Utils._isEmpty(bruttoInntekt)
    );
  },
};

const kreverInntektskilder = (options: any) => {
  if (options?.parent?.skatteforholdsperioder) {
    return !erBrukerSkattepliktigIHelePerioden(options.parent.skatteforholdsperioder);
  }
  return true;
};

const vurdering_trygdeavgift = object().shape({
  skatteforholdsperioder: array()
    .min(1)
    .of(
      object().shape({
        fomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
          .erEtterDatofelt("fomDato")
          .required(MAA_FYLLES_UT),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      }),
    ),
  inntektskilder: lazy((_value, options) => {
    if (kreverInntektskilder(options)) {
      return array()
        .min(1)
        .of(
          object().shape({
            kildetype: string().required(MAA_FYLLES_UT),
            arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
            bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
            fomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
              .required(MAA_FYLLES_UT),
            tomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
              .erEtterDatofelt("fomDato")
              .required(MAA_FYLLES_UT),
          }),
        );
    }
    return array();
  }),
});

export default vurdering_trygdeavgift;
