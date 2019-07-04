/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const LandkodePropType = PT.shape({
  kode: PT.string,
  term: PT.string,
});

const LandkoderPropType = PT.arrayOf(LandkodePropType);

export {
  LandkodePropType as Landkode,
  LandkoderPropType as Landkoder,
};
