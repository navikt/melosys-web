import { array, boolean, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
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
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medl.periode" };
const DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = { melding: "Dekker ikke hele medlemskapsperioden" };
const OVERLAPPENDE_PERIODER = { melding: "Skatteforholdsperiodene kan ikke overlappe" };
const LIKE_SKATTEPLIKTTYPER = { melding: "Alle skatteforholdsperiodene har samme svar på spørsmålet om skatteplikt" };

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

// Helper function to sort periods by start date
const sorterPerioderEtterStartdato = (perioder) => {
  return [...perioder].sort((a, b) => {
    const aFom = Utils.dato.formatterDatoTilISO(a.fomDato);
    const bFom = Utils.dato.formatterDatoTilISO(b.fomDato);
    return aFom.localeCompare(bFom);
  });
};

const erInnenforMedlemskapsperiodeTest = {
  name: "erInnenforMedlemskapsperiode",
  message: UTENFOR_MEDLEMSKAPSPERIODEN,
  test: (datoString, schema) => {
    if (!datoString) return true;

    try {
      const { medlemskapsperiode } = schema.options.context;

      const medlemskapsperiodeFom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato);
      const medlemskapsperiodeTom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato);
      const isoDatoString = Utils.dato.formatterDatoTilISO(datoString);

      if (!isoDatoString) return false;

      return isoDatoString >= medlemskapsperiodeFom && isoDatoString <= medlemskapsperiodeTom;
    } catch (error) {
      return false;
    }
  },
};

const dekkerHeleMedlemskapsperiodeTest = {
  name: "dekkerHeleMedlemskapsperiode",
  message: DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN,
  test: (perioder, schema) => {
    if (!perioder || perioder.length === 0) return true;

    try {
      const { medlemskapsperiode } = schema.options.context;

      const medlemskapsperiodeFom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato);
      const medlemskapsperiodeTom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato);

      // Sort periods by start date
      const sortedPerioder = sorterPerioderEtterStartdato(perioder);

      // Dekning
      const firstFom = Utils.dato.formatterDatoTilISO(sortedPerioder[0].fomDato);
      if (!firstFom || firstFom !== medlemskapsperiodeFom) return false;

      const lastTom = Utils.dato.formatterDatoTilISO(sortedPerioder[sortedPerioder.length - 1].tomDato);
      if (!lastTom || lastTom !== medlemskapsperiodeTom) return false;

      // Opphold
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < sortedPerioder.length - 1; i++) {
        const currentTom = Utils.dato.formatterDatoTilISO(sortedPerioder[i].tomDato);
        const nextFom = Utils.dato.formatterDatoTilISO(sortedPerioder[i + 1].fomDato);

        // Convert to Date objects
        const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
        const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

        if (currentTomDate && nextFomDate) {
          // Add 1 day to the end date
          const tomDateForComparison = new Date(currentTomDate);
          tomDateForComparison.setDate(tomDateForComparison.getDate() + 1);

          // Check if the next period starts more than one day after this period ends
          // For consecutive dates (like 10-12-2024 and 11-12-2024), tomDateForComparison will equal fomDate
          if (tomDateForComparison.getTime() < nextFomDate.getTime()) return false;
        }
      }

      return true;
    } catch (error) {
      return true;
    }
  },
};

const ingenOverlappendeSkatteforholdsperioderTest = {
  name: "ingenOverlappendeSkatteforholdsperioder",
  message: OVERLAPPENDE_PERIODER,
  test: (perioder) => {
    if (!perioder || perioder.length <= 1) return true;

    try {
      // Sort periods by start date
      const sortedPerioder = sorterPerioderEtterStartdato(perioder);

      // Check for overlapping periods
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < sortedPerioder.length - 1; i++) {
        const currentTom = Utils.dato.formatterDatoTilISO(sortedPerioder[i].tomDato);
        const nextFom = Utils.dato.formatterDatoTilISO(sortedPerioder[i + 1].fomDato);

        // Convert to Date objects
        const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
        const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

        if (currentTomDate && nextFomDate) {
          if (currentTomDate.getTime() >= nextFomDate.getTime()) return false;
        }
      }

      return true;
    } catch (error) {
      return true;
    }
  },
};

const ikkeAlleSammeSkatteforholdstyperTest = {
  name: "ikkeAlleSammeSkatteforholdstyper",
  message: LIKE_SKATTEPLIKTTYPER,
  test: (perioder) => {
    if (!perioder || perioder.length <= 1) return true;

    try {
      const skatteplikttyper = perioder.map((periode) => periode.skatteplikttype);

      const perioderHarSammeType = skatteplikttyper.every((type) => type === skatteplikttyper[0]);

      return !perioderHarSammeType;
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
  erAvvik: boolean().required(MAA_FYLLES_UT),
  skatteforholdsperioder: array().when(["erAvvik"], {
    is: (erAvvik) => erAvvik === true,
    then: array()
      .min(1, "Minst en skatteforholdsperiode")
      .of(skatteforholdsperiodeSchema)
      .test(dekkerHeleMedlemskapsperiodeTest)
      .test(ingenOverlappendeSkatteforholdsperioderTest)
      .test(ikkeAlleSammeSkatteforholdstyperTest),
    otherwise: array(),
  }),
  inntektskilder: array().when(["$medlemskapsTypeErPliktig", "erAvvik", "skatteforholdsperioder"], {
    is: (medlemskapsTypeErPliktig, erAvvik, skatteforholdsperioder) => {
      return (
        erAvvik === true && (!medlemskapsTypeErPliktig || !erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder))
      );
    },
    then: array().min(1, "Minst en inntektskilde").of(inntektskildeSchema).test(dekkerHeleMedlemskapsperiodeTest),
    otherwise: array(),
  }),
});

export default aarsavregningMedGrunnlagSchema;
