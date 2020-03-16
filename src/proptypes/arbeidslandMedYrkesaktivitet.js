/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Kodeverk } from './kodeverk';

const ArbeidslandMedYrkesaktivitet = PT.shape({
  land: Kodeverk.isRequired,
  erLonnetArbeid: PT.bool.isRequired,
  erSelvstendigNaeringsvirksomhet: PT.bool.isRequired,
});

export { ArbeidslandMedYrkesaktivitet };
