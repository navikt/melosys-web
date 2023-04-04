import { object, string, array } from "yup";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import { BOOLSK_STRING } from "../../../../../constants";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const { NÆRINGSINNTEKT_FRA_NORGE, INNTEKT_FRA_UTLANDET, FN_SKATTEFRITAK } = MKV.Koder.inntektskildetype;

export const bruttoInntektKreves = (skattepliktig, inntektskilde, arbAvgBetales) =>
  skattepliktig === BOOLSK_STRING.USANN ||
  [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK].includes(inntektskilde) ||
  (inntektskilde === INNTEKT_FRA_UTLANDET && arbAvgBetales === BOOLSK_STRING.USANN);

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: { message: "Fyll inn brutto inntekt" },
  test: (bruttoInntekt, schema) => {
    const { skattepliktig } = schema.from[1].value;
    const { inntektskilde, arbAvgBetales } = schema.from[0].value;

    return !(bruttoInntektKreves(skattepliktig, inntektskilde, arbAvgBetales) && Utils._isEmpty(bruttoInntekt));
  },
};

const vurdering_trygdeavgift = object().shape({
  skattepliktig: string().required(MAA_FYLLES_UT),
  inntektsrader: array().of(
    object().shape({
      inntektskilde: string().required(MAA_FYLLES_UT),
      arbAvgBetales: string().required(MAA_FYLLES_UT),
      bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
    })
  ),
});

export default vurdering_trygdeavgift;
