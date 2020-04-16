import * as Utils from '../../../../utils';

const {
  object,
  string,
  bool,
  array,
} = Utils.yup;

const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottakerinstitusjon kreves' };
const LOVVALGSLAND_KREVES = { melding: 'Lovvalgsland kreves' };
const OPPGI_ET_LAND = { melding: 'Oppgi et land.' };

const artikkel13_utpek = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjoner: array().of(object().shape({
    kreverMottakerinstitusjon: bool(),
    id: string().when('kreverMottakerinstitusjon', {
      is: true,
      then: string().required(MOTTAKERINSTITUSJON_KREVES),
    }),
  })),
  lovvalgsland: string()
    .when('$erOffentligArbeidUtland', {
      is: true,
      then: string()
        .erLandKode(OPPGI_ET_LAND)
        .required(LOVVALGSLAND_KREVES),
    }),
});

export { artikkel13_utpek };
