/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const BekreftelserPropType = PT.shape({
  utsendt: PT.bool,
  ansatt: PT.bool,
  erstatter: PT.bool,
  over24m: PT.bool,
  arbeidsgiveravgift: PT.bool,
  trygdeavgift: PT.shape({
    trukket: PT.bool,
    tom: PT.string,
  }),
});

export { BekreftelserPropType as Bekreftelser };
