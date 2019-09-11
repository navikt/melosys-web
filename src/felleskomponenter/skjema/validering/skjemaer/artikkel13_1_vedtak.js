import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;

const artikkel13_1_vedtak = object().shape({
  forkortLovvalgsperiode: bool().required(),
  tomDato: string()
    .when('forkortLovvalgsperiode', {
      is: true,
      then: string().required({ melding: 'Dato kreves' })
        .validDate({ melding: 'Dato kreves' })
        .periodeErGyldig({ melding: 'Ugyldig periode' }),
    }),
});

export { artikkel13_1_vedtak };
