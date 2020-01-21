import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;

const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottakerinstitusjon kreves' };

const artikkel13_1_b_utpek = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when('kreverMottakerinstitusjon', {
    is: true,
    then: string().required(MOTTAKERINSTITUSJON_KREVES),
  }),
});

export { artikkel13_1_b_utpek };
