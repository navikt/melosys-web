import { array, object, string } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const { NÆRINGSINNTEKT_FRA_NORGE, INNTEKT_FRA_UTLANDET, FN_SKATTEFRITAK, MISJONÆR } = MKV.Koder.inntektskildetype;
const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

export const arbAvgBetalesKreves = (kildetype) => kildetype !== MISJONÆR;

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.avg. betales når det kreves",
  message: { message: "Velg om arb.avg. betales til skatt" },
  test: (arbAvgBetales, schema) => {
    const { kildetype } = schema.from[0].value;

    return !(arbAvgBetalesKreves(kildetype) && Utils._isEmpty(arbAvgBetales));
  },
};

export const bruttoInntektKreves = (skattepliktig, kildetype, arbAvgBetales) =>
  skattepliktig === IKKE_SKATTEPLIKTIG ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK].includes(kildetype) ||
  (kildetype === INNTEKT_FRA_UTLANDET && arbAvgBetales === BOOLSK_STRING.USANN);

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: { message: "Fyll inn brutto inntekt" },
  test: (bruttoInntekt, schema) => {
    const { skattepliktig } = schema.from[1].value;
    const { kildetype, arbAvgBetales } = schema.from[0].value;

    return !(bruttoInntektKreves(skattepliktig, kildetype, arbAvgBetales) && Utils._isEmpty(bruttoInntekt));
  },
};

const vurdering_trygdeavgift = object().shape({
  skattepliktig: string().required(MAA_FYLLES_UT),
  inntektskilder: array().of(
    object().shape({
      kildetype: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
      arbAvgBetales: string().required(MAA_FYLLES_UT),
      bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
    })
  ),
});

export default vurdering_trygdeavgift;
