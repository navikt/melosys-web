import { array, lazy, object, string } from "yup";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

import { erBrukerSkattepliktigIHelePerioden } from "../../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import {
  arbAvgBetalesKreves,
  bruttoInntektKreves,
} from "../../../felleskomponenter/trygdeavgift/komponenter/schemaUtils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const UTENFOR_HELSEUTGIFT_DEKKES_PERIODE = { melding: "Utenfor helseutgift dekkes periode" };

const arbAvgBetalesFyltUtNårDetKrevesTest = {
  name: "Fyll inn arb.ag. betales når det kreves",
  message: { message: "Velg om arb.ag. betales til skatt" },
  test: (arbAvgBetales: any, schema: any) => {
    const { kildetype } = schema.from[0].value;

    return !(arbAvgBetalesKreves(kildetype, false) && Utils._isEmpty(arbAvgBetales));
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

const kreverInntektskilder = (options: any) => {
  if (options?.parent?.skatteforholdsperioder) {
    return !erBrukerSkattepliktigIHelePerioden(options.parent.skatteforholdsperioder);
  }
  return true;
};

const vurdering_trygdeavgift = object().shape({
  skatteforholdsperioder: array()
    .min(1)
    .of(
      object().shape({
        fomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
          .required(MAA_FYLLES_UT),
        tomDato: string()
          .erGyldigDato()
          .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
          .erEtterDatofelt("fomDato")
          .required(MAA_FYLLES_UT),
        skatteplikttype: string().required(MAA_FYLLES_UT),
      }),
    ),
  inntektskilder: lazy((_value, options) => {
    if (kreverInntektskilder(options)) {
      return array()
        .min(1)
        .of(
          object().shape({
            kildetype: string().required(MAA_FYLLES_UT),
            arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
            bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
            fomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
              .required(MAA_FYLLES_UT),
            tomDato: string()
              .erGyldigDato()
              .erInnenforPeriode("helseutgiftDekkesPeriode", UTENFOR_HELSEUTGIFT_DEKKES_PERIODE)
              .erEtterDatofelt("fomDato")
              .required(MAA_FYLLES_UT),
          }),
        );
    }
    return array();
  }),
});

export default vurdering_trygdeavgift;
