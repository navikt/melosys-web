/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Periode } from './periode';

const OppholdEnkeltPropType = PT.shape({
  landKode: PT.string,
  erGyldig: PT.bool,
  begrunnelseKode: PT.string,
});

const OppholdPropType = PT.shape({
  land: PT.arrayOf(OppholdEnkeltPropType),
  periode: Periode,
});

export { OppholdPropType as Opphold };
