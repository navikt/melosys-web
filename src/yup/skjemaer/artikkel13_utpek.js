import {
  object,
  string,
  bool,
  array,
} from 'yup';

const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottakerinstitusjon kreves' };
const LOVVALGSLAND_KREVES = { melding: 'Lovvalgsland kreves' };
const OPPGI_ET_LAND = { melding: 'Oppgi et land.' };

const artikkel13_utpek = object().shape({
  forkortUtpekingsperiode: bool().required(),
  tomDato: string()
    .when('forkortUtpekingsperiode', {
      is: true,
      then: string()
        .endretPeriodeErGyldig({ melding: 'Ugyldig periode' })
        .erGyldigDato({ melding: 'Gyldig dato kreves' })
        .required({ melding: 'Dato kreves' }),
    }),
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjoner: array().of(object().shape({
    kreverMottakerinstitusjon: bool(),
    id: string().when('kreverMottakerinstitusjon', {
      is: true,
      then: string().required(MOTTAKERINSTITUSJON_KREVES),
    }),
  })),
  lovvalgsland: string()
    .when('$validerLovvalgsland', {
      is: true,
      then: string()
        .erLandKode(OPPGI_ET_LAND)
        .required(LOVVALGSLAND_KREVES),
    }),
});

export { artikkel13_utpek };
