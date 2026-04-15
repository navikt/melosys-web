import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";
import * as Datoutils from "../../../../../utils/dato";
import { erUlagretPeriode } from "./aarsavregningUtenEllerDeltGrunnlag";

import { erBrukerSkattepliktigIHelePerioden } from "../utils";

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
const UTENFOR_HELSEUTGIFTDEKKESPERIODEN = { melding: "Utenfor periode Norge dekker helseutgifter" };
const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

export const arbAvgBetalesKreves = (kildetype, medlemskapsTypeErPliktig) =>
  !medlemskapsTypeErPliktig && kildetype !== MISJONÆR;

const erMedlemskapsTypePliktig = (medlemskapsperioder) => {
  const medlemskapsTypeErPliktig = medlemskapsperioder
    .filter((periode) => !erUlagretPeriode(periode.id))
    .every((periode) => {
      if (periode.type === "HELSEUTGIFTDEKKESPERIODE") return true;
      return periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG;
    });

  return medlemskapsTypeErPliktig;
};

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: { melding: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    const { avgiftspliktigperioder } = schema.from[1].value;
    const medlemskapsTypeErPliktig = erMedlemskapsTypePliktig(avgiftspliktigperioder);

    return !(arbAvgBetalesKreves(kildetype, medlemskapsTypeErPliktig) && Utils._isEmpty(arbAvgBetales));
  },
};

const erGyldigOgKunTall = (datoString) => {
  const datoUtenSkilletegn = datoString.replace(/[-./]/g, "");
  if (!/^\d+$/.test(datoUtenSkilletegn)) {
    return false;
  }
  return Boolean(Utils.dato.vaskInputDato(datoString));
};

const erInnenforValgtAarTest = {
  name: "Utenfor valgt år",
  message: {
    melding: `Utenfor valgt år`,
  },
  test: (datoString, schema) => {
    const aar = schema?.options?.context?.aar;
    if (!datoString) return false;
    if (!erGyldigOgKunTall(datoString)) return true;
    const dato = new Date(Datoutils.vaskOgFormatterTilISO(datoString));
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
  message: MAA_FYLLES_UT,
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

// Simple test for checking if a date is within medlemskapsperiode range
const erInnenforAvgiftspliktigperiodeTest = {
  name: "erInnenforAvgiftspliktigperiode",
  test: function (datoString, schema) {
    if (Utils._isEmpty(datoString)) return true;

    // MELOSYS-7612: Valider kun komplette datoer for å unngå valideringsfeil under typing
    // Sjekk at datoen har riktig format (dd.mm.åååå) før vi validerer mot medlemskapsperiode
    const vasketDato = Utils.dato.vaskInputDato(datoString);
    if (!vasketDato || vasketDato.length < 10) return true;

    const { avgiftspliktigperioder } = schema.from[1].value;
    if (!avgiftspliktigperioder || avgiftspliktigperioder.length === 0) return true;

    const gyldigePerioder = avgiftspliktigperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigePerioder.length === 0) return true;

    const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const fom = sortertePerioder[0].fomDato;
    const tom = sortertePerioder[sortertePerioder.length - 1].tomDato;

    const erInnenfor = Utils.dato.erIPeriode(
      Utils.dato.vaskOgFormatterTilISO(fom),
      Utils.dato.vaskOgFormatterTilISO(tom),
      Utils.dato.vaskOgFormatterTilISO(datoString),
      "[]",
    );

    if (!erInnenfor) {
      const erHelseutgift =
        avgiftspliktigperioder.length > 0 && avgiftspliktigperioder.every((p) => p.type === "HELSEUTGIFTDEKKESPERIODE");
      return this.createError({
        message: erHelseutgift ? UTENFOR_HELSEUTGIFTDEKKESPERIODEN : UTENFOR_MEDLEMSKAPSPERIODEN,
      });
    }

    return true;
  },
};

const medlemskapsperiodeSchema = object().shape({
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforValgtAarTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .erEtterDatofelt("fomDato")
    .test(åpenTomTest)
    .test(erInnenforValgtAarTest),
  trygdedekning: string().when("type", {
    is: (type) => type === "HELSEUTGIFTDEKKESPERIODE",
    then: (schema) => schema.nullable().notRequired(),
    otherwise: (schema) => schema.required(MAA_FYLLES_UT),
  }),
  bostedLandkode: string().when("type", {
    is: (type) => type === "HELSEUTGIFTDEKKESPERIODE",
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
});

const skatteforholdsperiodeSchema = object().shape({
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforAvgiftspliktigperiodeTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .test(åpenTomTest)
    .test(erInnenforAvgiftspliktigperiodeTest)
    .erEtterDatofelt("fomDato"),
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
    .test(erInnenforAvgiftspliktigperiodeTest)
    .erEtterDatofelt("fomDato"),
});

const aarsavregningUtenEllerDeltGrunnlagSchema = object().shape({
  bestemmelse: string().when(["endeligAvgiftValg", "avgiftspliktigperioder"], {
    is: (endeligAvgiftValg, avgiftspliktigperioder) => {
      if (endeligAvgiftValg !== OPPLYSNINGER_ENDRET) return false;
      const erHelseutgift =
        avgiftspliktigperioder?.length > 0 &&
        avgiftspliktigperioder.every((p) => p.type === "HELSEUTGIFTDEKKESPERIODE");
      return !erHelseutgift;
    },
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  endeligAvgiftValg: string().required(MAA_FYLLES_UT),
  avgiftspliktigperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET,
    then: (schema) => schema.min(1, "Minst en medlemskapsperiode").of(medlemskapsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  trygdeavgiftFraAvgiftssystemet: string().when(["$harTrygdeavgiftFraAvgiftssystemet", "avgiftspliktigperioder"], {
    is: (harTrygdeavgiftFraAvgiftssystemet, avgiftspliktigperioder) => {
      if (!harTrygdeavgiftFraAvgiftssystemet) return false;
      const erHelseutgift =
        avgiftspliktigperioder?.length > 0 &&
        avgiftspliktigperioder.every((p) => p.type === "HELSEUTGIFTDEKKESPERIODE");
      return !erHelseutgift;
    },
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  skatteforholdsperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET,
    then: (schema) => schema.min(1, "Minst en skatteforholdsperiode").of(skatteforholdsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  inntektskilder: array().when(["avgiftspliktigperioder", "skatteforholdsperioder", "endeligAvgiftValg"], {
    is: (avgiftspliktigperioder, skatteforholdsperioder, endeligAvgiftValg) => {
      if (endeligAvgiftValg !== OPPLYSNINGER_ENDRET) return false;
      const medlemskapsTypeErPliktig = erMedlemskapsTypePliktig(avgiftspliktigperioder);

      return !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder));
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

export default aarsavregningUtenEllerDeltGrunnlagSchema;
