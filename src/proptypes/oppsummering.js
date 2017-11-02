/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const OppsummeringPropType = PT.shape({
  behandlingsStatus: PT.shape({
    kode: PT.string,
    term: PT.string,
  }),
  opprettet: PT.string,
  sistOppdatert: PT.string,
});

export {
  OppsummeringPropType as Oppsummering,
};
