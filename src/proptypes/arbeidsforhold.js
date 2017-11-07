/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Periode } from './periode';
import { Arbeidsavtale } from './arbeidsavtale';
import { OrgnummerNavn } from './organisasjon';

const ArbeidsforholdPropType = PT.shape({
  arbeidsforholdID: PT.string,
  arbeidsforholdIDnav: PT.number,
  ansettelsesPeriode: Periode,
  arbeidsforholdstype: PT.string,
  permisjonOgPermittering: PT.array,
  utenlandsopphold: PT.array,
  arbeidsavtale: PT.arrayOf(Arbeidsavtale),
  arbeidsgiver: OrgnummerNavn,
  arbeidstakerID: PT.string,
  opplysningspliktig: OrgnummerNavn,
  arbeidsforholdInnrapportertEtterAOrdningen: PT.bool,
});

const ArbeidsforholdenePropType = PT.arrayOf(ArbeidsforholdPropType);

export {
  ArbeidsforholdenePropType as Arbeidsforholdene,
  ArbeidsforholdPropType as Arbeidsforhold,
};
