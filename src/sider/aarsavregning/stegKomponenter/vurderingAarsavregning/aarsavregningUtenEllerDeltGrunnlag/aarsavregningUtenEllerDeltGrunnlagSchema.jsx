import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";
import * as Datoutils from "../../../../../utils/dato";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "./aarsavregningUtenEllerDeltGrunnlag";

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
const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

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
  message: { melding: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    const { medlemskapsperioder } = schema.from[1].value;
    const medlemskapsTypeErPliktig = erMedlemskapsTypePliktig(medlemskapsperioder);

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
const erInnenforMedlemskapsperiodeTest = {
  name: "erInnenforMedlemskapsperiode",
  message: UTENFOR_MEDLEMSKAPSPERIODEN,
  test: (datoString, schema) => {
    if (Utils._isEmpty(datoString)) return true;

    // MELOSYS-7612: Valider kun komplette datoer for å unngå valideringsfeil under typing
    // Sjekk at datoen har riktig format (dd.mm.åååå) før vi validerer mot medlemskapsperiode
    const vasketDato = Utils.dato.vaskInputDato(datoString);
    if (!vasketDato || vasketDato.length < 10) return true;

    // Get medlemskapsperioder directly from form values
    const { medlemskapsperioder } = schema.from[1].value;
    if (!medlemskapsperioder || medlemskapsperioder.length === 0) return true;

    const gyldigePerioder = medlemskapsperioder.filter((p) => p.fomDato && p.tomDato);
    if (gyldigePerioder.length === 0) return true;

    const sortertePerioder = [...gyldigePerioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const fom = sortertePerioder[0].fomDato;
    const tom = sortertePerioder[sortertePerioder.length - 1].tomDato;

    return Utils.dato.erIPeriode(
      Utils.dato.vaskOgFormatterTilISO(fom),
      Utils.dato.vaskOgFormatterTilISO(tom),
      Utils.dato.vaskOgFormatterTilISO(datoString),
      "[]",
    );
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
  trygdedekning: string().required(MAA_FYLLES_UT),
});

const skatteforholdsperiodeSchema = object().shape({
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
});

const inntektskildeSchema = object().shape({
  kildetype: string().required(MAA_FYLLES_UT),
  arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
  bruttoInntekt: string().test(bruttoInntektFyltUtNårDetKrevesTest),
  fomDato: string().required(MAA_FYLLES_UT).erGyldigDato().test(erInnenforMedlemskapsperiodeTest),
  tomDato: string()
    .required(MAA_FYLLES_UT)
    .erGyldigDato()
    .test(erInnenforMedlemskapsperiodeTest)
    .erEtterDatofelt("fomDato"),
});

const aarsavregningUtenEllerDeltGrunnlagSchema = object().shape({
  bestemmelse: string().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET,
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  endeligAvgiftValg: string().required(MAA_FYLLES_UT),
  medlemskapsperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET,
    then: (schema) => schema.min(1, "Minst en medlemskapsperiode").of(medlemskapsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  trygdeavgiftFraAvgiftssystemet: string().when(["$harTrygdeavgiftFraAvgiftssystemet"], {
    is: true,
    then: (schema) => schema.required(MAA_FYLLES_UT),
    otherwise: (schema) => schema.nullable(),
  }),
  skatteforholdsperioder: array().when(["endeligAvgiftValg"], {
    is: (endeligAvgiftValg) => endeligAvgiftValg === OPPLYSNINGER_ENDRET,
    then: (schema) => schema.min(1, "Minst en skatteforholdsperiode").of(skatteforholdsperiodeSchema),
    otherwise: (schema) => schema,
  }),
  inntektskilder: array().when(["medlemskapsperioder", "skatteforholdsperioder", "endeligAvgiftValg"], {
    is: (medlemskapsperioder, skatteforholdsperioder, endeligAvgiftValg) => {
      if (endeligAvgiftValg !== OPPLYSNINGER_ENDRET) return false;
      const medlemskapsTypeErPliktig = erMedlemskapsTypePliktig(medlemskapsperioder);

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
