import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";
import * as Datoutils from "../../../../../utils/dato";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "./aarsavregningUtenEllerDeltGrunnlag";

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
const UTENFOR_MEDLEMSKAPSPERIODEN = { melding: "Utenfor medlemskapsperiode" };

export const arbAvgBetalesKreves = (kildetype, medlemskapsTypeErPliktig) =>
  !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

const erMedlemskapsTypePliktig = (medlemskapsperioder) => {
  const medlemskapsTypeErPliktig = medlemskapsperioder
    .filter((periode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
    .every((periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG);

  return medlemskapsTypeErPliktig;
};

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: "Velg om arb.ag. betales til skatt",
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    const { medlemskapsperioder } = schema.from[1].value;
    const medlemskapsTypeErPliktig = erMedlemskapsTypePliktig(medlemskapsperioder);

    return !(arbAvgBetalesKreves(kildetype, medlemskapsTypeErPliktig) && Utils._isEmpty(arbAvgBetales));
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

const harUgyldigeDatoer = (perioder) => {
  return perioder.some(
    (periode) =>
      !periode.fomDato ||
      !periode.tomDato ||
      !Utils.dato.vaskInputDato(periode.fomDato) ||
      !Utils.dato.vaskInputDato(periode.tomDato),
  );
};

// No changes to these tests
const medlemskapsperioderOverlappTest = {
  name: "medlemskapsperioderOverlapp",
  message: "Medlemskapsperiodene kan ikke overlappe hverandre",
  test: (perioder) => {
    if (!perioder || perioder.length <= 1) {
      return true;
    }

    if (harUgyldigeDatoer(perioder)) {
      return true;
    }

    const gyldigePerioder = perioder.filter((periode) => periode.fomDato && periode.tomDato);
    if (gyldigePerioder.length <= 1) {
      return true;
    }

    const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < sortertePerioder.length; i++) {
      // eslint-disable-next-line no-plusplus
      for (let j = i + 1; j < sortertePerioder.length; j++) {
        if (
          Utils.dato.perioderOverlapper(
            sortertePerioder[i].fomDato,
            sortertePerioder[i].tomDato,
            sortertePerioder[j].fomDato,
            sortertePerioder[j].tomDato,
          )
        ) {
          return false;
        }
      }
    }

    return true;
  },
};

const medlemskapsperioderKontinuerligTest = {
  name: "medlemskapsperioderKontinuerlig",
  message: "Medlemskapsperiodene må danne en sammenhengende periode uten opphold",
  test: (perioder) => {
    if (!perioder || perioder.length <= 1) {
      return true;
    }

    if (harUgyldigeDatoer(perioder)) {
      return true;
    }

    const gyldigePerioder = perioder.filter((periode) => periode.fomDato && periode.tomDato);
    if (gyldigePerioder.length <= 1) {
      return true;
    }

    const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);

    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < sortertePerioder.length; i++) {
      const forrigePeriode = sortertePerioder[i - 1];
      const currentPeriode = sortertePerioder[i];

      const forrigeTomDate = Utils.dato.norskStringTilDate(forrigePeriode.tomDato);
      const currentFomDate = Utils.dato.norskStringTilDate(currentPeriode.fomDato);

      if (!forrigeTomDate || !currentFomDate) {
        return false;
      }

      // Sjekk for opphold - neste periode må starte dagen etter forrige sluttet
      const nesteDag = new Date(forrigeTomDate);
      nesteDag.setDate(nesteDag.getDate() + 1);

      if (currentFomDate.getTime() !== nesteDag.getTime()) {
        return false;
      }
    }

    return true;
  },
};

const medlemskapsperioderSammeBestemmelseTest = {
  name: "medlemskapsperioderSammeBestemmelse",
  message: "Alle medlemskapsperioder må ha samme bestemmelse",
  test: (perioder) => {
    if (!perioder || perioder.length <= 1) {
      return true;
    }

    if (harUgyldigeDatoer(perioder)) {
      return true;
    }

    const bestemmelseSet = new Set(
      perioder.filter((periode) => periode.bestemmelse).map((periode) => periode.bestemmelse),
    );

    return bestemmelseSet.size <= 1;
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

const skatteforholdsperioderOverlappTest = {
  name: "skatteforholdsperioderOverlapp",
  message: "Skatteforholdsperiodene kan ikke overlappe",
  test: (skatteforholdsperioder) => {
    if (!skatteforholdsperioder || skatteforholdsperioder.length <= 1) {
      return true;
    }

    if (harUgyldigeDatoer(skatteforholdsperioder)) {
      return true;
    }

    const gyldigePerioder = skatteforholdsperioder.filter((periode) => periode.fomDato && periode.tomDato);
    if (gyldigePerioder.length <= 1) {
      return true;
    }

    const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < sortertePerioder.length; i++) {
      // eslint-disable-next-line no-plusplus
      for (let j = i + 1; j < sortertePerioder.length; j++) {
        if (
          Utils.dato.perioderOverlapper(
            sortertePerioder[i].fomDato,
            sortertePerioder[i].tomDato,
            sortertePerioder[j].fomDato,
            sortertePerioder[j].tomDato,
          )
        ) {
          return false;
        }
      }
    }

    return true;
  },
};

const skatteforholdsDekkerMedlemskapTest = {
  name: "skatteforholdsDekkerMedlemskap",
  message: "Skatteforholdsperioden(e) du har lagt inn dekker ikke hele medlemskapsperioden(e)",
  test: (skatteforholdsperioder, schema) => {
    const { medlemskapsperioder } = schema.parent || {};

    const gyldigeMedlemskapsPerioder = medlemskapsperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigeMedlemskapsPerioder.length === 0) return true;

    const sorterteMedlemskapsperioder = [...gyldigeMedlemskapsPerioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const medlemskapStart = Utils.dato.norskStringTilDate(sorterteMedlemskapsperioder[0].fomDato);
    const medlemskapSlutt = Utils.dato.norskStringTilDate(
      sorterteMedlemskapsperioder[sorterteMedlemskapsperioder.length - 1].tomDato,
    );

    if (!medlemskapStart || !medlemskapSlutt) return false;

    const gyldigeSkatteperioder = skatteforholdsperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigeSkatteperioder.length === 0) return false;

    const sorterteSkatteperioder = [...gyldigeSkatteperioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const skatteStart = Utils.dato.norskStringTilDate(sorterteSkatteperioder[0].fomDato);
    const skatteSlutt = Utils.dato.norskStringTilDate(
      sorterteSkatteperioder[sorterteSkatteperioder.length - 1].tomDato,
    );

    if (!skatteStart || !skatteSlutt) return false;

    if (skatteStart.getDate() !== medlemskapStart.getDate() || skatteSlutt.getDate() !== medlemskapSlutt.getDate()) {
      return false;
    }

    for (let i = 1; i < sorterteSkatteperioder.length; i++) {
      const forrigePeriodeSlutt = Utils.dato.norskStringTilDate(sorterteSkatteperioder[i - 1].tomDato);
      const dennePeriodeStart = Utils.dato.norskStringTilDate(sorterteSkatteperioder[i].fomDato);

      if (!forrigePeriodeSlutt || !dennePeriodeStart) return false;

      const nesteDag = new Date(forrigePeriodeSlutt);
      nesteDag.setDate(nesteDag.getDate() + 1);

      if (dennePeriodeStart.getDate() !== nesteDag.getDate()) {
        return false;
      }
    }

    return true;
  },
};

const inntektsperioderDekkerMedlemskapTest = {
  name: "inntektskildeDekkerMedlemskap",
  message: "Inntektsperioden(e) du har lagt inn dekker ikke hele medlemskapsperioden(e)",
  test: (inntektskilder, schema) => {
    const { medlemskapsperioder } = schema.parent || {};

    const gyldigeMedlemskapsPerioder = medlemskapsperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigeMedlemskapsPerioder.length === 0) return true;

    const sorterteMedlemskapsperioder = [...gyldigeMedlemskapsPerioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const medlemskapStart = Utils.dato.norskStringTilDate(sorterteMedlemskapsperioder[0].fomDato);
    const medlemskapSlutt = Utils.dato.norskStringTilDate(
      sorterteMedlemskapsperioder[sorterteMedlemskapsperioder.length - 1].tomDato,
    );

    if (!medlemskapStart || !medlemskapSlutt) return false;

    const gyldigeSkatteperioder = inntektskilder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigeSkatteperioder.length === 0) return false;

    const sorterteInntektskilder = [...gyldigeSkatteperioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const skatteStart = Utils.dato.norskStringTilDate(sorterteInntektskilder[0].fomDato);
    const skatteSlutt = Utils.dato.norskStringTilDate(
      sorterteInntektskilder[sorterteInntektskilder.length - 1].tomDato,
    );

    if (!skatteStart || !skatteSlutt) return false;

    if (skatteStart.getDate() !== medlemskapStart.getDate() || skatteSlutt.getDate() !== medlemskapSlutt.getDate()) {
      return false;
    }

    for (let i = 1; i < sorterteInntektskilder.length; i++) {
      const forrigePeriodeSlutt = Utils.dato.norskStringTilDate(sorterteInntektskilder[i - 1].tomDato);
      const dennePeriodeStart = Utils.dato.norskStringTilDate(sorterteInntektskilder[i].fomDato);

      if (!forrigePeriodeSlutt || !dennePeriodeStart) return false;

      const nesteDag = new Date(forrigePeriodeSlutt);
      nesteDag.setDate(nesteDag.getDate() + 1);

      if (dennePeriodeStart.getDate() !== nesteDag.getDate()) {
        return false;
      }
    }

    return true;
  },
};

const aarsavregningUtenEllerDeltGrunnlagSchema = object().shape({
  medlemskapsperioder: array()
    .min(1, "Minst en medlemskapsperiode")
    .of(
      object().shape({
        fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforValgtAarTest),
        tomDato: string()
          .required(MAA_FYLLES_UT)
          .erGyldigDato()
          .erEtterDatofelt("fomDato")
          .test(åpenTomTest)
          .test(erInnenforValgtAarTest),
        trygdedekning: string().required(),
        bestemmelse: string().required(),
      }),
    )
    .test(medlemskapsperioderOverlappTest)
    .test(medlemskapsperioderKontinuerligTest)
    .test(medlemskapsperioderSammeBestemmelseTest),
  totaltForskuddsvisFakturert: string().nullable().required(MAA_FYLLES_UT),
  skatteforholdsperioder: array()
    .min(1, "Minst en skatteforholdsperiode")
    .of(
      object().shape({
        fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforValgtAarTest),
        tomDato: string()
          .required(MAA_FYLLES_UT)
          .erGyldigDato()
          .test(åpenTomTest)
          .test(erInnenforValgtAarTest)
          .erEtterDatofelt("fomDato"),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      }),
    )
    .test(skatteforholdsperioderOverlappTest)
    .test(skatteforholdsDekkerMedlemskapTest)
    .test(skatteforholdsperioderHarUlikSkattepliktTest),
  inntektskilder: array().when(["medlemskapsperioder", "skatteforholdsperioder"], {
    is: (medlemskapsperioder, skatteforholdsperioder) => {
      const medlemskapsTypeErPliktig = erMedlemskapsTypePliktig(medlemskapsperioder);

      return !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder));
    },
    then: array()
      .min(1, "Minst en inntektskilde")
      .of(
        object().shape({
          kildetype: string().required(MAA_FYLLES_UT),
          arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
          bruttoInntekt: string().test(bruttoInntektFyltUtNårDetKrevesTest),
          fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforValgtAarTest),
          tomDato: string()
            .required(MAA_FYLLES_UT)
            .erGyldigDato()
            .test(erInnenforValgtAarTest)
            .erEtterDatofelt("fomDato"),
        }),
      )
      .test(inntektsperioderDekkerMedlemskapTest),
    otherwise: array(),
  }),
});

export default aarsavregningUtenEllerDeltGrunnlagSchema;
