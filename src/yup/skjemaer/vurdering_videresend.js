import { object, string, bool } from 'yup';

const VELG_MOTTAKERINSTITUSJON = { melding: 'Velg mottakerinstitusjon' };

export const vurdering_videresend = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when('kreverMottakerinstitusjon', {
    is: true,
    then: string().required(VELG_MOTTAKERINSTITUSJON),
  }),
});
