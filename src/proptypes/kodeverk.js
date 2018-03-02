/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const KodeverkPropType = PT.shape({
  kode: PT.string,
  term: PT.string,
});

export { KodeverkPropType as Kodeverk };
