/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Periode } from './periode';

const OppholdEnkeltPropType = PT.shape({
  landkode: PT.string,
  erGyldig: PT.bool,
  begrunnelseKode: PT.string,
});

const OppholdLandPropType = PT.arrayOf(OppholdEnkeltPropType);

const OppholdPeriodePropType = PT.shape({
  periode: Periode,
});

export {
  OppholdLandPropType as OppholdLand,
  OppholdPeriodePropType as OppholdPeriode,
};
