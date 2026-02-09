import { object, string } from "yup";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import { erBrukerSkattepliktigIHelePerioden } from "../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import { arbAvgBetalesKreves, bruttoInntektKreves } from "../../felleskomponenter/trygdeavgift/komponenter/schemaUtils";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

export const lagSkatteforholdShape = (periodeNavn: string, periodeFeilmelding: { melding: string }) =>
  object().shape({
    fomDato: string().erGyldigDato().erInnenforPeriode(periodeNavn, periodeFeilmelding).required(MAA_FYLLES_UT),
    tomDato: string()
      .erGyldigDato()
      .erInnenforPeriode(periodeNavn, periodeFeilmelding)
      .erEtterDatofelt("fomDato")
      .required(MAA_FYLLES_UT),
    skatteplikttype: string().required(MAA_FYLLES_UT),
  });

export const lagInntektskildeShape = (
  periodeNavn: string,
  periodeFeilmelding: { melding: string },
  brukMedlemskapsTypeFraKontekst: boolean,
) => {
  const arbAvgBetalesFyltUtNårDetKrevesTest = {
    name: "Fyll inn arb.ag. betales når det kreves",
    message: { message: "Velg om arb.ag. betales til skatt" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test: (arbAvgBetales: any, schema: any) => {
      const { kildetype } = schema.from[0].value;
      const medlemskapsTypeErPliktig = brukMedlemskapsTypeFraKontekst
        ? schema?.options?.context?.medlemskapsTypeErPliktig
        : false;
      return !(arbAvgBetalesKreves(kildetype, medlemskapsTypeErPliktig) && Utils._isEmpty(arbAvgBetales));
    },
  };

  const bruttoInntektFyltUtNårDetKrevesTest = {
    name: "Fyll inn brutto inntekt når det kreves",
    message: { message: "Fyll inn brutto inntekt" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test: (bruttoInntekt: any, schema: any) => {
      const { skatteforholdsperioder } = schema.from[1].value;
      const { kildetype, arbAvgBetales } = schema.from[0].value;
      const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);
      return !(
        bruttoInntektKreves(brukerSkattepliktigIHelePerioden, kildetype, arbAvgBetales) && Utils._isEmpty(bruttoInntekt)
      );
    },
  };

  return object().shape({
    kildetype: string().required(MAA_FYLLES_UT),
    arbAvgBetales: string().test(arbAvgBetalesFyltUtNårDetKrevesTest).nullable(),
    bruttoInntekt: string().erNummer().test(bruttoInntektFyltUtNårDetKrevesTest).nullable(),
    fomDato: string().erGyldigDato().erInnenforPeriode(periodeNavn, periodeFeilmelding).required(MAA_FYLLES_UT),
    tomDato: string()
      .erGyldigDato()
      .erInnenforPeriode(periodeNavn, periodeFeilmelding)
      .erEtterDatofelt("fomDato")
      .required(MAA_FYLLES_UT),
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const kreverInntektskilder = (medlemskapsTypeErPliktig: boolean, options: any) => {
  if (options?.parent?.skatteforholdsperioder) {
    return !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(options.parent.skatteforholdsperioder));
  }
  return true;
};
