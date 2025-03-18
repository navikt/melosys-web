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

// Simple test for checking if a date is within medlemskapsperiode range
const erInnenforMedlemskapsperiodeTest = {
  name: "erInnenforMedlemskapsperiode",
  message: UTENFOR_MEDLEMSKAPSPERIODEN,
  test: (datoString, schema) => {
    if (Utils._isEmpty(datoString) || !Utils.dato.vaskInputDato(datoString)) return true;

    // Get medlemskapsperioder directly from form values
    const { medlemskapsperioder } = schema.from[1].value;
    if (!medlemskapsperioder || medlemskapsperioder.length === 0) return true;

    const gyldigePerioder = medlemskapsperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigePerioder.length === 0) return true;

    const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const fom = sortertePerioder[0].fomDato;
    const tom = sortertePerioder[sortertePerioder.length - 1].tomDato;

    return Utils.dato.erIPeriode(
      Utils.dato.formatterDatoTilISO(fom),
      Utils.dato.formatterDatoTilISO(tom),
      Utils.dato.formatterDatoTilISO(datoString),
      "[]",
    );
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
        fomDato: string()
          .required(MAA_FYLLES_UT)
          .erGyldigDato()
          .test(erInnenforValgtAarTest)
          .test(erInnenforMedlemskapsperiodeTest),
        tomDato: string()
          .required(MAA_FYLLES_UT)
          .erGyldigDato()
          .test(åpenTomTest)
          .test(erInnenforValgtAarTest)
          .test(erInnenforMedlemskapsperiodeTest)
          .erEtterDatofelt("fomDato"),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      }),
    ),
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
          fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforMedlemskapsperiodeTest),
          tomDato: string()
            .required(MAA_FYLLES_UT)
            .erGyldigDato()
            .test(erInnenforMedlemskapsperiodeTest)
            .erEtterDatofelt("fomDato"),
        }),
      ),
    otherwise: array(),
  }),
});

export default aarsavregningUtenEllerDeltGrunnlagSchema;
