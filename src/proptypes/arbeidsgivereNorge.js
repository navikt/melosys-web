/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Organisasjon } from './organisasjon';
import { Arbeidsforholdene } from './arbeidsforhold';
import { Inntekt } from './inntekt';

const ArbeidsgivereNorgePropType = PT.arrayOf(PT.shape({
  arbeidsgiver: PT.shape({
    organisasjon: Organisasjon,
    arbeidsforhold: Arbeidsforholdene,
    inntektListe: Inntekt,
  }),
}));

export { ArbeidsgivereNorgePropType as ArbeidsgivereNorge };
