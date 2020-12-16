import {
  object,
  string,
  array,
  bool,
  number,
} from 'yup';

import MKV from '../../melosyskodeverk';

const AVGIFTSGRUNNLAG_FEIL = { melding: 'Avgiftsgrunnlag er ikke gyldig' };
const LØNNSFORHOLD_FEIL = { melding: 'Lønnsforhold er ikke gyldig' };
const TRYGDEAVGIFTSGRUNNLAGNORGE_FEIL = { melding: 'TrygdeavgiftsgrunnlagNorge er ikke gyldig' };
const TRYGDEAVGIFTSGRUNNLAGUTLAND_FEIL = { melding: 'TrygdeavgiftsgrunnlagUtland er ikke gyldig' };
const AVGIFTSBEREGNING_FEIL = { melding: 'Avgiftsberegning er ikke beregnet' };

function erTrygdeavgiftsgrunnlagGyldig(trygdeavgiftsgrunnlag) {
  return (trygdeavgiftsgrunnlag
    && (trygdeavgiftsgrunnlag.erSkattepliktig || trygdeavgiftsgrunnlag.erSkattepliktig === false)
    && (trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift || trygdeavgiftsgrunnlag.betalerArbeidsgiverAvgift === false)
    && (trygdeavgiftsgrunnlag.særligAvgiftsgruppe === null || (!!trygdeavgiftsgrunnlag.særligAvgiftsgruppe && trygdeavgiftsgrunnlag.særligAvgiftsgruppe !== 'TRUE')));
}

function sjekkOmTrygdeavgiftsgrunnlagNorgeErUgyldig(avgiftsgrunnlag) {
  if (!avgiftsgrunnlag) return true;
  return !erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge);
}

function sjekkOmTrygdeavgiftsgrunnlagUtlandErUgyldig(avgiftsgrunnlag) {
  if (!avgiftsgrunnlag) return true;
  return !erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
}

function sjekkOmLønnsforholdErUgyldig(avgiftsgrunnlag) {
  return (!avgiftsgrunnlag || !avgiftsgrunnlag.lønnsforhold);
}

function sjekkOmAvgiftsgrunnlagErUgyldig(avgiftsgrunnlag) {
  if (!avgiftsgrunnlag || !avgiftsgrunnlag.lønnsforhold) return true;
  switch (avgiftsgrunnlag.lønnsforhold) {
    case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
      return !erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge);
    case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
      return !erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
    case MKV.Koder.loenn_forhold.DELT_LØNN:
      return !erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagNorge) || !erTrygdeavgiftsgrunnlagGyldig(avgiftsgrunnlag.trygdeavgiftsgrunnlagUtland);
    default:
      return true;
  }
}

function sjekkOmAvgiftsberegningIkkeErBeregnet(avgiftsgrunnlag, avgiftsberegning) {
  if (!avgiftsgrunnlag || !avgiftsgrunnlag.lønnsforhold) return true;
  switch (avgiftsgrunnlag.lønnsforhold) {
    case MKV.Koder.loenn_forhold.LØNN_FRA_NORGE:
      if (avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV) return false;
      return !avgiftsberegning.avgiftspliktigLønnNorge;
    case MKV.Koder.loenn_forhold.LØNN_FRA_UTLANDET:
      if (avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV) return false;
      return !avgiftsberegning.avgiftspliktigLønnUtland;
    case MKV.Koder.loenn_forhold.DELT_LØNN:
      if (avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV
        && avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV) {
        return false;
      }
      if (avgiftsgrunnlag.vurderingTrygdeavgiftNorskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_norsk_inntekt.NORSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV) {
        return !avgiftsberegning.avgiftspliktigLønnUtland;
      }
      if (avgiftsgrunnlag.vurderingTrygdeavgiftUtenlandskInntekt === MKV.Koder.vurderingsutfall_trygdeavgift_utenlandsk_inntekt.UTENLANDSK_INNTEKT_INGEN_TRYGDEAVGIFT_NAV) {
        return !avgiftsberegning.avgiftspliktigLønnNorge;
      }
      return !avgiftsberegning.avgiftspliktigLønnNorge || !avgiftsberegning.avgiftspliktigLønnUtland;
    default:
      return true;
  }
}


const vurdering_trygdeavgift = object().shape({
  avgiftsgrunnlag: object().shape({
    lønnsforhold: string().nullable(),
    trygdeavgiftsgrunnlagNorge: object().shape({
      erSkattepliktig: bool(),
      betalerArbeidsgiverAvgift: bool(),
      særligAvgiftsgruppe: string().nullable(),
    }).nullable(),
    trygdeavgiftsgrunnlagUtland: object().shape({
      erSkattepliktig: bool(),
      betalerArbeidsgiverAvgift: bool(),
      særligAvgiftsgruppe: string().nullable(),
    }).nullable(),
  }).nullable(),
  avgiftsberegning: object().shape({
    avgiftspliktigLønnNorge: number().nullable(),
    avgiftsperioderNorge: array().of(object().shape({
      fom: string()
        .required(),
      tom: string()
        .nullable(),
      trygdedekning: string()
        .required(),
      avgiftssats: number()
        .required(),
      avgiftPerMd: number()
        .required(),
    })),
    avgiftspliktigLønnUtland: number().nullable(),
    avgiftsperioderUtland: array().of(object().shape({
      fom: string()
        .required(),
      tom: string()
        .nullable(),
      trygdedekning: string()
        .required(),
      avgiftssats: number()
        .required(),
      avgiftPerMd: number()
        .required(),
    })),
  }),
  erAvgiftsgrunnlagUgyldig: string()
    .when('avgiftsgrunnlag', {
      is: sjekkOmAvgiftsgrunnlagErUgyldig,
      then: string()
        .required(AVGIFTSGRUNNLAG_FEIL),
    }),
  erLønnsforholdUgyldig: string()
    .when('avgiftsgrunnlag', {
      is: sjekkOmLønnsforholdErUgyldig,
      then: string()
        .required(LØNNSFORHOLD_FEIL),
    }),
  erTrygdeavgiftsgrunnlagNorgeUgyldig: string()
    .when('avgiftsgrunnlag', {
      is: sjekkOmTrygdeavgiftsgrunnlagNorgeErUgyldig,
      then: string()
        .required(TRYGDEAVGIFTSGRUNNLAGNORGE_FEIL),
    }),
  erTrygdeavgiftsgrunnlagUtlandUgyldig: string()
    .when('avgiftsgrunnlag', {
      is: sjekkOmTrygdeavgiftsgrunnlagUtlandErUgyldig,
      then: string()
        .required(TRYGDEAVGIFTSGRUNNLAGUTLAND_FEIL),
    }),
  erAvgiftsberegningBeregnet: string()
    .when(['avgiftsgrunnlag', 'avgiftsberegning'], {
      is: sjekkOmAvgiftsberegningIkkeErBeregnet,
      then: string()
        .required(AVGIFTSBEREGNING_FEIL),
    }),
});

export { vurdering_trygdeavgift };
