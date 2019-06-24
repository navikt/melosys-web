import * as Utils from '../../../../utils';

const { object, date, bool } = Utils.yup;

const artikkel13_1_a = object().shape({
  forkortLovvalgsperiode: bool().required(),
  tomDato: date()
    .when('forkortLovvalgsperiode', {
      is: true,
      then: date().required('Dato kreves'),
    }),
});

export { artikkel13_1_a };
