import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;

const VELG_EN_VEDTAKSTYPE = { melding: 'Velg en vedtakstype' };
const OPPGI_BEGRUNNELSE = { melding: 'Oppgi begrunnelse' };
const MOTTAKERINSTITUSJON_KREVES = { melding: 'Mottakerinstitusjon kreves' };

const artikkel12_vedtak = object().shape({
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
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when('kreverMottakerinstitusjon', {
    is: true,
    then: string().required(MOTTAKERINSTITUSJON_KREVES),
  }),
});

export { artikkel12_vedtak };
