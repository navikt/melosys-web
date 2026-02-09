import { array, lazy, object, string } from "yup";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

import { erBrukerSkattepliktigIHelePerioden } from "../../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import {
  arbAvgBetalesKreves,
  bruttoInntektKreves,
} from "../../../felleskomponenter/trygdeavgift/komponenter/schemaUtils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const UTENFOR_MEDLEMSKAPSPERIODEN_ELLER_LOVVALGSPERIODEN = { melding: "Utenfor medlemskaps-/lovvalgsperioden" };

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: { message: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales: any, schema: any) => {
    const { kildetype } = schema.from[0].value;

    return !(
      arbAvgBetalesKreves(kildetype, schema?.options?.context?.medlemskapsTypeErPliktig) &&
      Utils._isEmpty(arbAvgBetales)
    );
  },
};

const bruttoInntektFyltUtNårDetKrevesTest = {
  name: "Fyll inn brutto inntekt når det kreves",
  message: { message: "Fyll inn brutto inntekt" },
  test: (bruttoInntekt: any, schema: any) => {
    const { skatteforholdsperioder } = schema.from[1].value;
    const { kildetype, arbAvgBetales } = schema.from[0].value;

    const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);

    return !(
      bruttoInntektKreves(brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) && Utils._isEmpty(bruttoInntekt)
    );
  },
};

const kreverInntektskilder = (medlemskapsTypeErPliktig: any, options: any) => {
  if (options?.parent?.skatteforholdsperioder) {
    return !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(options.parent.skatteforholdsperioder));
  }
  return true;
};

const vurdering_trygdeavgift = object().shape({
  skatteforholdsperioder: array().when(["$erÅpenSluttDato"], {
    is: (erÅpenSluttDato: any) => !erÅpenSluttDato,
    then: (schema) =>
      schema.min(1).of(
        object().shape({
          fomDato: string()
            .erGyldigDato()
            .erInnenforPeriode("avgiftspliktigeperiode", UTENFOR_MEDLEMSKAPSPERIODEN_ELLER_LOVVALGSPERIODEN)
            .required(MAA_FYLLES_UT),
          tomDato: string()
            .erGyldigDato()
            .erInnenforPeriode("avgiftspliktigeperiode", UTENFOR_MEDLEMSKAPSPERIODEN_ELLER_LOVVALGSPERIODEN)
            .erEtterDatofelt("fomDato")
            .required(MAA_FYLLES_UT),
          skatteplikttype: string().required(MAA_FYLLES_UT),
        }),
      ),
  }),
  inntektskilder: lazy((_value, options) => {
    return array().when(["$medlemskapsTypeErPliktig", "$erÅpenSluttDato"], {
      is: (medlemskapsTypeErPliktig: any, erÅpenSluttDato: any) =>
        !erÅpenSluttDato && kreverInntektskilder(medlemskapsTypeErPliktig, options),
      then: (schema) =>
        schema.min(1).of(
          object().shape({
            kildetype: string().required(MAA_FYLLES_UT),
            arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
            bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
            fomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("avgiftspliktigeperiode", UTENFOR_MEDLEMSKAPSPERIODEN_ELLER_LOVVALGSPERIODEN)
              .required(MAA_FYLLES_UT),
            tomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("avgiftspliktigeperiode", UTENFOR_MEDLEMSKAPSPERIODEN_ELLER_LOVVALGSPERIODEN)
              .erEtterDatofelt("fomDato")
              .required(MAA_FYLLES_UT),
          }),
        ),
    });
  }),
});

export default vurdering_trygdeavgift;
