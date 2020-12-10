import {
  object,
  string,
  array,
  bool,
  number,
} from 'yup';

import MKV from '../../melosyskodeverk';

const NOE_SKJEDDE = { melding: 'Noe skjedde' };

function erInntektsInformasjonValid(inntektsinformasjon) {
  return (inntektsinformasjon
    && (inntektsinformasjon.erSkattepliktig || inntektsinformasjon.erSkattepliktig === false)
    && (inntektsinformasjon.betalerArbeidsgiverAvgift || inntektsinformasjon.betalerArbeidsgiverAvgift === false)
    && (inntektsinformasjon.særligAvgiftsgruppe === null || (!!inntektsinformasjon.særligAvgiftsgruppe && inntektsinformasjon.særligAvgiftsgruppe !== 'TRUE')));
}

function sjekkOmAvgiftsLoennErUgyldig(avgiftsLønn) {
  if (!avgiftsLønn || !avgiftsLønn.lønnsforhold) return true;
  switch (avgiftsLønn.lønnsforhold) {
    case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
      return !erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonNorge);
    case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
      return !erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonUtland);
    case MKV.Koder.loenn_forhold.DELT_LØNN:
      return !(erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonNorge) && erInntektsInformasjonValid(avgiftsLønn.inntektsInformasjonUtland));
    default:
      return false;
  }
}

const vurdering_trygdeavgift = object().shape({
  avgiftsLoenn: object().shape({
    lønnsforhold: string().nullable(),
    inntektsInformasjonNorge: object().shape({
      erSkattepliktig: bool(),
      betalerArbeidsgiverAvgift: bool(),
      særligAvgiftsgruppe: string().nullable(),
    }).nullable(),
    inntektsInformasjonUtland: object().shape({
      erSkattepliktig: bool(),
      betalerArbeidsgiverAvgift: bool(),
      særligAvgiftsgruppe: string().nullable(),
    }).nullable(),
  }).nullable(),
  avgiftsBeregning: object().shape({
    avgiftspliktigLønnNorge: number(),
    avgiftsperioderNorge: array().of(object().shape({
      fom: string()
        .required(),
      tom: string()
        .required(),
      trygdedekning: string()
        .required(),
      avgiftssats: number()
        .required(),
      avgiftPerMd: number()
        .required(),
    })),
    avgiftspliktigLønnUtland: number(),
    avgiftsperioderUtland: array().of(object().shape({
      fom: string()
        .required(),
      tom: string()
        .required(),
      trygdedekning: string()
        .required(),
      avgiftssats: number()
        .required(),
      avgiftPerMd: number()
        .required(),
    })),
  }),
  erAvgiftsLoennUgyldig: string()
    .when('avgiftsLoenn', {
      is: sjekkOmAvgiftsLoennErUgyldig,
      then: string()
        .required(NOE_SKJEDDE),
    }),
});

export { vurdering_trygdeavgift };
