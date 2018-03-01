/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Periode } from './periode';
import { Permisjoner } from './permisjon';
import { TimerTimelonnet } from './timerTimelonnet';
import { Arbeidsavtale } from './arbeidsavtale';
import { InntektEnkeltLinje } from './inntekt';

const ArbeidsforholdetPropType = PT.shape({
  arbeidsforholdID: PT.string,
  arbeidsforholdIDnav: PT.number,
  ansettelsesPeriode: Periode,
  arbeidsforholdstype: PT.string,
  permisjonOgPermittering: Permisjoner,
  timerTimelonnet: TimerTimelonnet,
  inntekt: PT.arrayOf(InntektEnkeltLinje),
  utenlandsopphold: PT.array,
  arbeidsgiverID: PT.string,
  arbeidstakerID: PT.string,
  opplysningspliktigID: PT.string,
  Aordning: PT.bool,
  arbeidsavtale: PT.arrayOf(Arbeidsavtale),
});

const ArbeidsforholdenePropType = PT.arrayOf(ArbeidsforholdetPropType);

export {
  ArbeidsforholdenePropType as Arbeidsforholdene,
  ArbeidsforholdetPropType as Arbeidsforholdet,
};
