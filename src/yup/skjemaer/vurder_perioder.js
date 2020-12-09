import {
  object,
  string,
  array,
} from 'yup';
import * as KV from '../../kodeverk';

const NOE_SKJEDDE = { melding: 'Noe skjedde' };

const allePerioderErAvslått = (medlemskapsperioder) => {
  if (!medlemskapsperioder) return false;
  const erAllePerioderAnnetEnnAvslatt = medlemskapsperioder.some(medlemskapsperiode => medlemskapsperiode.innvilgelsesResultat !== KV.Koder.AVSLAATT);
  return !erAllePerioderAnnetEnnAvslatt;
};
const erNoenPerioderUfullført = (medlemskapsperioder) => {
  return medlemskapsperioder && medlemskapsperioder.some(medlemskapsperiode => medlemskapsperiode.ny ||
    !(medlemskapsperiode.innvilgelsesResultat && medlemskapsperiode.trygdedekning && medlemskapsperiode.fomDato && medlemskapsperiode.fomDato !== 'Invalid date'));
};
const erFeilAktivPåPerioder = (medlemskapsperioder) => {
  return medlemskapsperioder && medlemskapsperioder.some(medlemskapsperiode => !!medlemskapsperiode.feil);
};

const vurder_perioder = object().shape({
  medlemskapsperioder: array().of(object().shape({
    id: string()
      .required(NOE_SKJEDDE),
    arbeidsland: string(),
    fomDato: string()
      .required(NOE_SKJEDDE),
    tomDato: string(),
    bestemmelse: string(),
    innvilgelsesResultat: string()
      .required(NOE_SKJEDDE),
    trygdedekning: string()
      .required(NOE_SKJEDDE),
    medlemskapstype: string()
  })),
  alleMedlemskapsperioderAvslått: string()
    .when('medlemskapsperioder', {
      is: allePerioderErAvslått,
      then: string()
        .required(NOE_SKJEDDE)
    }),
  noenPerioderUfullført: string()
    .when('medlemskapsperioder', {
      is: erNoenPerioderUfullført,
      then: string()
        .required(NOE_SKJEDDE)
    }),
  feilAktivPåPerioder: string()
    .when('medlemskapsperioder', {
      is: erFeilAktivPåPerioder,
      then: string()
        .required(NOE_SKJEDDE)
    })
});

export { vurder_perioder };
