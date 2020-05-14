import { object, string } from 'yup';

import MKV from '../../melosyskodeverk';

const VELG_EN_VEDTAKSTYPE = { melding: 'Velg en vedtakstype' };
const OPPGI_BEGRUNNELSE = { melding: 'Oppgi begrunnelse' };

const artikkel16_vedtak = object().shape({
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
});

export { artikkel16_vedtak };
