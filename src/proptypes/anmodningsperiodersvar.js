import PT from 'prop-types';
import { Periode } from './periode';

const AnmodningsperioderSvarProptype = PT.shape({
  begrunnelseFritekst: PT.string,
  anmodningsperiodeSvarType: PT.string,
  endretPeriode: Periode,
});

export { AnmodningsperioderSvarProptype as AnmodningsperioderSvar };
