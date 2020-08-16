import { object, string, bool, array } from 'yup';

import MKV from '../../melosyskodeverk';

const VELG_EN_BESTEMMELSE = 'Velg en bestemmelse.';
const VELG_EN_VEDTAKSTYPE = { melding: 'Velg en vedtakstype' };
const OPPGI_BEGRUNNELSE = { melding: 'Oppgi begrunnelse' };
const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottakerinstitusjon kreves' };
const VELG_OM_UTENLANDSK_TRYGDEMYNDIGHET_SKAL_INFORMERES = { melding: 'Velg om utenlandsk trygdemyndighet skal informeres' };
const VELG_LAND = { melding: 'Velg land' };

const arbeid_ett_land_ovrig_vedtak = object().shape({
  lovvalgsbestemmelse: string()
    .required(VELG_EN_BESTEMMELSE),
  forkortLovvalgsperiode: bool().required(),
  tomDato: string()
    .when('forkortLovvalgsperiode', {
      is: true,
      then: string()
        .endretPeriodeErGyldig({ melding: 'Ugyldig periode' })
        .erGyldigDato({ melding: 'Gyldig dato kreves' })
        .required({ melding: 'Dato kreves' }),
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
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when('kreverMottakerinstitusjon', {
    is: true,
    then: string().required(MOTTAKERINSTITUSJON_KREVES),
  }),
  informerUtenlandskTrygdemyndighet: bool()
    .nullable()
    .required(VELG_OM_UTENLANDSK_TRYGDEMYNDIGHET_SKAL_INFORMERES),
  mottakerLand: string()
    .when('informerUtenlandskTrygdemyndighet', {
      is: true,
      then: string()
        .required(VELG_LAND),
    }),
});

export { arbeid_ett_land_ovrig_vedtak };
