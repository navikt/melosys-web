import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;

const OPPGI_EN_BEGRUNNELSE = { melding: 'Oppgi en begrunnelse' };
const VELG_OM_ANMODNING_OM_MER_INFORMASJON_VIL_BLI_SENDT = { melding: 'Velg om anmodning om mer informasjon vil bli sendt' };

const avslaa_utpeking = object().shape({
  begrunnelseUtenlandskMyndighet: string()
    .required(OPPGI_EN_BEGRUNNELSE),
  vilSendeAnmodningOmMerInformasjon: bool()
    .required(VELG_OM_ANMODNING_OM_MER_INFORMASJON_VIL_BLI_SENDT),
});

export { avslaa_utpeking };
