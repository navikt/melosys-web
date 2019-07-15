import * as Utils from '../../../../utils';

const { object, array, string } = Utils.yup;

const artikkel16mottasvar = object().shape({
  endretPeriode: object().shape({
  }),
});

export { artikkel16mottasvar };
