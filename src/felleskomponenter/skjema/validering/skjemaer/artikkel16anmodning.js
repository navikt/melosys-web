import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;
const VELG_MOTTAKERINSTITUSJON = { melding: 'Velg mottakerinstitusjon' };

export const artikkel16_anmodning = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when('kreverMottakerinstitusjon', {
    is: true,
    then: string().required(VELG_MOTTAKERINSTITUSJON),
  }),
});
