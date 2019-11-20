import * as MKV from 'melosys-kodeverk';

import * as Utils from '../../../../utils';

const { object, string } = Utils.yup;

const VELG_EN_VEDTAKSTYPE = { melding: 'Velg en vedtakstype' };
const OPPGI_BEGRUNNELSE = { melding: 'Oppgi begrunnelse' };

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
});

export { artikkel12_vedtak };
