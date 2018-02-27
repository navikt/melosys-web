/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const SoknadFormPropType = PT.shape({
  kode: PT.string,
  term: PT.string,
});

export { SoknadFormPropType as SoknadForm };
