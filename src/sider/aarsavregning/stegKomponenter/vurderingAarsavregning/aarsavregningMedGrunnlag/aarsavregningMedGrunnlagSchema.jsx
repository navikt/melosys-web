import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

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
const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medl.periode" };
const UTENFOR_HELSEDUTGIFTDEKKESPERIODEN = { melding: "Utenfor periode Norge dekker helseutgifter" };

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
      const { avgiftspliktigperiode, erHelseutgiftDekkesPeriode } = schema.options.context;

      const avgiftspliktigperiodeFom = Utils.dato.formatterDatoTilISO(avgiftspliktigperiode.fomDato);
      const avgiftspliktigperiodeTom = Utils.dato.formatterDatoTilISO(avgiftspliktigperiode.tomDato);
      const isoDatoString = Utils.dato.formatterDatoTilISO(datoString);

      if (!isoDatoString) return false;

      const erInnenfor = isoDatoString >= avgiftspliktigperiodeFom && isoDatoString <= avgiftspliktigperiodeTom;

      if (!erInnenfor) {
        return this.createError({
          message: erHelseutgiftDekkesPeriode ? UTENFOR_HELSEDUTGIFTDEKKESPERIODEN : UTENFOR_MEDLEMSKAPSPERIODEN,
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
  skatteforholdsperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET,
    then: (schema) => schema.min(1, "Minst en skatteforholdsperiode").of(skatteforholdsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  inntektskilder: array().when(["$medlemskapsTypeErPliktig", "endeligAvgiftValg", "skatteforholdsperioder"], {
    is: (medlemskapsTypeErPliktig, endeligAvgiftValg, skatteforholdsperioder) => {
      return (
        endeligAvgiftValg === OPPLYSNINGER_ENDRET &&
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
