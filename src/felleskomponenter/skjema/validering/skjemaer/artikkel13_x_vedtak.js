import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../utils';

const {
  object, string, bool, array,
} = Utils.yup;

const VELG_EN_VEDTAKSTYPE = { melding: 'Velg en vedtakstype' };
const OPPGI_BEGRUNNELSE = { melding: 'Oppgi begrunnelse' };
const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottaker institusjon kreves' };

const artikkel13_x_vedtak = object().shape({
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

export { artikkel13_x_vedtak };
