import PT from 'prop-types';
import * as MPT from './index';

const AnmodningsperioderSvarProptype = PT.shape({
  begrunnelseFritekst: PT.string,
  anmodningsperiodeSvarType: PT.string.isRequired,
  endretPeriode: MPT.Periode,
});

export { AnmodningsperioderSvarProptype as AnmodningsperioderSvar };
