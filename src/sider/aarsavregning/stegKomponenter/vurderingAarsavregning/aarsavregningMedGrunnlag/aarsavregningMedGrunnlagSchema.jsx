import { array, lazy, object, string, boolean } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";

import { erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import { isoStringTilDate } from "../../../../../utils/dato";

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
  message: { message: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    return !(
      arbAvgBetalesKreves(kildetype, schema?.options?.context?.medlemskapsTypeErPliktig) &&
      Utils._isEmpty(arbAvgBetales)
    );
  },
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

// eslint-disable
const skatteforholdsDekkerMedlemskapTest = {
  name: "skatteforholdsDekkerMedlemskap",
  message: "Skatteforholdsperioden(e) du har lagt inn dekker ikke hele medlemskapsperioden(e)",
  // eslint-disable-next-line object-shorthand
  test: function (skatteforholdsperioder) {
    const { medlemskapsperiode } = this.options.context;

    if (!medlemskapsperiode) return true;

    const gyldigeSkatteperioder = skatteforholdsperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigeSkatteperioder.length === 0) return false;

    const sorterteSkatteperioder = [...gyldigeSkatteperioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const skatteStart = Utils.dato.norskStringTilDate(sorterteSkatteperioder[0].fomDato);
    const skatteSlutt = Utils.dato.norskStringTilDate(
      sorterteSkatteperioder[sorterteSkatteperioder.length - 1].tomDato,
    );

    if (!skatteStart || !skatteSlutt) return false;

    if (
      skatteStart.getDate() !== Utils.dato.isoStringTilDate(medlemskapsperiode.fom).getDate() ||
      skatteSlutt.getDate() !== Utils.dato.isoStringTilDate(medlemskapsperiode.tom).getDate()
    ) {
      return false;
    }

    // for (let i = 1; i < sorterteSkatteperioder.length; i++) {
    //   const forrigePeriodeSlutt = Utils.dato.norskStringTilDate(sorterteSkatteperioder[i - 1].tomDato);
    //   const dennePeriodeStart = Utils.dato.norskStringTilDate(sorterteSkatteperioder[i].fomDato);
    //
    //   if (!forrigePeriodeSlutt || !dennePeriodeStart) return false;
    //
    //   const nesteDag = new Date(forrigePeriodeSlutt);
    //   nesteDag.setDate(nesteDag.getDate() + 1);
    //
    //   if (dennePeriodeStart.getDate() !== nesteDag.getDate()) {
    //     return false;
    //   }
    // }

    return true;
  },
};

const skatteforholdsperioderHarUlikSkattepliktTest = {
  name: "skatteforholdsperioderHarUlikSkatteplikt",
  message: "Skatteforholdsperioder må ha ulik skatteplikttype",
  test: (skatteforholdsperioder) => {
    if (!skatteforholdsperioder || skatteforholdsperioder.length <= 1) {
      return true;
    }

    const gyldige = skatteforholdsperioder.filter((periode) => periode.skatteplikttype);
    if (gyldige.length <= 1) {
      return true;
    }

    const skattepliktTypes = gyldige.map((periode) => periode.skatteplikttype);

    const uniqueTypes = new Set(skattepliktTypes);
    return uniqueTypes.size === skattepliktTypes.length;
  },
};

const aarsavregningMedGrunnlagSchema = object().shape({
  skatteforholdsperioder: array().when(["$erÅpenSluttDato", "$erAvvik"], {
    is: (erÅpenSluttDato, erAvvik) => {
      if (!erAvvik) return false;
      if (erAvvik === undefined) return true;
      return !erÅpenSluttDato && erAvvik;
    },
    then: array()
      .min(1, "Minst en skatteforholdsperiode")
      .of(
        object().shape({
          fomDato: string()
            .required(MAA_FYLLES_UT)
            .erGyldigDato()
            .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN),
          tomDato: string()
            .required(MAA_FYLLES_UT)
            .erGyldigDato()
            .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
            .erEtterDatofelt("fomDato"),
          skatteplikttype: string().required(MAA_FYLLES_UT),
        }),
      )
      .test(skatteforholdsDekkerMedlemskapTest)
      .test(skatteforholdsperioderHarUlikSkattepliktTest),
  }),
  inntektskilder: lazy((_value, options) => {
    return array().when(["$medlemskapsTypeErPliktig", "$erÅpenSluttDato", "$erAvvik"], {
      is: (medlemskapsTypeErPliktig, erÅpenSluttDato, erAvvik) => {
        if (!erAvvik) return false;
        return !erÅpenSluttDato && kreverInntektskilder(medlemskapsTypeErPliktig, options) && erAvvik;
      },
      then: array()
        .min(1, "Minst en inntektskilde")
        .of(
          object().shape({
            kildetype: string().required(MAA_FYLLES_UT),
            arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
            bruttoInntekt: string().test(bruttoInntektFyltUtNårDetKrevesTest),
            fomDato: string()
              .required(MAA_FYLLES_UT)
              .erGyldigDato()
              .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN),
            tomDato: string()
              .required(MAA_FYLLES_UT)
              .erGyldigDato()
              .erInnenforPeriode("medlemskapsperiode", UTENFOR_MEDLEMSKAPSPERIODEN)
              .erEtterDatofelt("fomDato"),
          }),
        ),
    });
  }),
});

export default aarsavregningMedGrunnlagSchema;
