/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Periode } from './periode';
import { Permisjoner } from './permisjon';
import { Arbeidsavtale } from './arbeidsavtale';

const ArbeidsforholdPropType = PT.shape({
  arbeidsforholdID: PT.string,
  arbeidsforholdIDnav: PT.number,
  ansettelsesPeriode: Periode,
  arbeidsforholdstype: PT.string,
  permisjonOgPermittering: Permisjoner,
  utenlandsopphold: PT.array,
  arbeidsgiverID: PT.string,
  arbeidstakerID: PT.string,
  opplysningspliktigID: PT.string,
  Aordning: PT.bool,
  arbeidsavtale: PT.arrayOf(Arbeidsavtale),
});

const ArbeidsforholdenePropType = PT.arrayOf(ArbeidsforholdPropType);

export {
  ArbeidsforholdenePropType as Arbeidsforholdene,
  ArbeidsforholdPropType as Arbeidsforhold,
};
