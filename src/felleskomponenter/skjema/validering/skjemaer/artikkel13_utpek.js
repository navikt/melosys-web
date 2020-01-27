import * as Utils from '../../../../utils';

const {
  object,
  string,
  bool,
  array,
} = Utils.yup;

const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottakerinstitusjon kreves' };

const artikkel13_utpek = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjoner: array().of(object().shape({
    kreverMottakerinstitusjon: bool(),
    id: string().when('kreverMottakerinstitusjon', {
      is: true,
      then: string().required(MOTTAKERINSTITUSJON_KREVES),
    }),
  })),
});

export { artikkel13_utpek };
