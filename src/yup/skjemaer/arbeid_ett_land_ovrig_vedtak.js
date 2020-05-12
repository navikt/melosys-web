import { object, string, bool, array } from 'yup';

import MKV from '../../melosyskodeverk';

const VELG_EN_BESTEMMELSE = 'Velg en bestemmelse.';
const VELG_EN_VEDTAKSTYPE = { melding: 'Velg en vedtakstype' };
const OPPGI_BEGRUNNELSE = { melding: 'Oppgi begrunnelse' };
const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottaker institusjon kreves' };

const arbeid_ett_land_ovrig_vedtak = object().shape({
  lovvalgsbestemmelse: string()
    .required(VELG_EN_BESTEMMELSE),
  forkortLovvalgsperiode: bool().required(),
  tomDato: string()
    .when('forkortLovvalgsperiode', {
      is: true,
      then: string()
        .required({ melding: 'Dato kreves' })
        .erGyldigDato({ melding: 'Dato kreves' })
        .periodeErGyldig({ melding: 'Ugyldig periode' }),
    }),
  vedtakstype: string()
    .when('$behandlingstype', {
      is: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      then: string()
        .nullable()
        .required(VELG_EN_VEDTAKSTYPE),
    }),
  vedtakstypebegrunnelse: string()
    .when('$behandlingstype', {
      is: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      then: string()
        .required(OPPGI_BEGRUNNELSE),
    }),
  mottakerinstitusjoner: array().of(object().shape({
    kreverMottakerinstitusjon: bool(),
    id: string().when('kreverMottakerinstitusjon', {
      is: true,
      then: string().required(MOTTAKERINSTITUSJON_KREVES),
    }),
  })),
});

export { arbeid_ett_land_ovrig_vedtak };
