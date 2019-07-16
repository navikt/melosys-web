import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;

/* eslint-disable */
const artikkel13_1_a_vedtak = object().shape({
  forkortLovvalgsperiode: bool().required(),
  tomDato: string()
    .when('forkortLovvalgsperiode', {
      is: true,
      then: string().required({ melding: 'Dato kreves' })
        .validDate({ melding: 'Dato kreves' })
        .test('periode er forkortet', { melding: 'Ugyldig periode' }, function test(value) {
          const { lovvalgsperiode } = this.options.context;
          return Utils.dato.erIPeriode(lovvalgsperiode.fomDato, lovvalgsperiode.tomDato, value);
        }),
      }),
});

export { artikkel13_1_a_vedtak };
