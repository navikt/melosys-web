import { array, lazy, object, string } from "yup";
import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import { BOOLSK_STRING } from "../../../constants";

import { erBrukerSkattepliktigIHelePerioden } from "../../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const {
  NÆRINGSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  FN_SKATTEFRITAK,
  MISJONÆR,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
} = MKV.Koder.inntektskildetype;
const UTENFOR_LOVVALGSPERIODEN = { melding: "Utenfor lovvalgsperioden" };

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

const kreverInntektskilder = (options) => {
  if (options?.parent?.skatteforholdsperioder) {
    return !erBrukerSkattepliktigIHelePerioden(options.parent.skatteforholdsperioder);
  }
  return true;
};

const vurdering_trygdeavgift = object().shape({
  skatteforholdsperioder: array().when(["$erÅpenSluttDato"], {
    is: (erÅpenSluttDato) => !erÅpenSluttDato,
    then: (schema) =>
      schema.min(1).of(
        object().shape({
          fomDato: string()
            .erGyldigDato()
            .erInnenforPeriode("lovvalgsperioder", UTENFOR_LOVVALGSPERIODEN)
            .required(MAA_FYLLES_UT),
          tomDato: string()
            .erGyldigDato()
            .erInnenforPeriode("lovvalgsperioder", UTENFOR_LOVVALGSPERIODEN)
            .erEtterDatofelt("fomDato")
            .required(MAA_FYLLES_UT),
          skatteplikttype: string().required(MAA_FYLLES_UT),
        }),
      ),
  }),
  inntektskilder: lazy((_value, options) => {
    return array().when(["$erÅpenSluttDato"], {
      is: (erÅpenSluttDato) => !erÅpenSluttDato && kreverInntektskilder(options),
      then: (schema) =>
        schema.min(1).of(
          object().shape({
            kildetype: string().required(MAA_FYLLES_UT),
            bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
            fomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("lovvalgsperioder", UTENFOR_LOVVALGSPERIODEN)
              .required(MAA_FYLLES_UT),
            tomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("lovvalgsperioder", UTENFOR_LOVVALGSPERIODEN)
              .erEtterDatofelt("fomDato")
              .required(MAA_FYLLES_UT),
          }),
        ),
    });
  }),
});

export default vurdering_trygdeavgift;
