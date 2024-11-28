import { array, lazy, object, string } from "yup";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import { BOOLSK_STRING } from "../../../../constants";

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

const kreverInntektskilder = (medlemskapsTypeErPliktig, options) => {
  if (options?.parent?.skatteforholdsperioder) {
    const inntektkilderErTom = options.parent.inntektskilder.length === 0;
    return !(
      medlemskapsTypeErPliktig &&
      erBrukerSkattepliktigIHelePerioden(options.parent.skatteforholdsperioder) &&
      inntektkilderErTom
    );
  }
  return true;
};

const erPeriodeSisteMedlemskapsperiode = (periodeId, formValues) => {
  const medlemskapsperioder = formValues?.medlemskapsperioder || [];
  return medlemskapsperioder[medlemskapsperioder.length - 1]?.periodeId?.toString() === periodeId;
};

const åpenTomNårIkkeSistePeriodeTest = {
  name: "Åpen sluttdato ved etterfølgende perioder",
  message: { melding: "Sluttdato må fylles ut når det finnes etterfølgende perioder" },
  test: (tomDato, schema) => {
    const erSisteMedlemskapsperiode = erPeriodeSisteMedlemskapsperiode(schema.parent.periodeId, schema.from[1].value);
    return !(!erSisteMedlemskapsperiode && Utils._isEmpty(tomDato));
  },
};

const vurdering_aarsavregning = object().shape({
  medlemskapsperioder: array().when(["$medlemskapsperiode", "$erIngenGrunnlag"], {
    is: (medlemskapsperiode, erIngenGrunnlag) => !medlemskapsperiode.fom || erIngenGrunnlag,
    then: array()
      .min(1, "Minst en medlemskapsperiode")
      .of(
        object().shape({
          fomDato: string()
            .erGyldigDato()
            .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
            .required(),
          tomDato: string()
            .erGyldigDato()
            .erEtterDatofelt("fomDato")
            .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
            .test(åpenTomNårIkkeSistePeriodeTest),
          trygdedekning: string().required(),
          bestemmelse: string().required(),
        })
      ),
  }),
  skatteforholdsperioder: array().when(["$erÅpenSluttDato", "$erAvvik", "$erIngenGrunnlag"], {
    is: (erÅpenSluttDato, erAvvik, erIngenGrunnlag) => !erÅpenSluttDato && (erAvvik || erIngenGrunnlag),
    then: array()
      .min(1, "Minst en skatteforholdsperiode")
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
      ),
  }),
  inntektskilder: lazy((_value, options) => {
    return array().when(["$medlemskapsTypeErPliktig", "$erÅpenSluttDato", "$erAvvik", "$erIngenGrunnlag"], {
      is: (medlemskapsTypeErPliktig, erÅpenSluttDato, erAvvik, erIngenGrunnlag) => {
        return (
          !erÅpenSluttDato && kreverInntektskilder(medlemskapsTypeErPliktig, options) && (erAvvik || erIngenGrunnlag)
        );
      },
      then: array()
        .min(1, "Minst en inntektskilde")
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
        ),
    });
  }),
});

export default vurdering_aarsavregning;
