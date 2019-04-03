/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const SoknadslandEnkeltPropType = PT.shape({
  landKode: PT.string,
  erGyldig: PT.bool,
  begrunnelseKode: PT.string,
});

const SoknadslandPropType = PT.arrayOf(SoknadslandEnkeltPropType);

export { SoknadslandPropType as Soknadsland };
