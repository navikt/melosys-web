import * as Utils from '../../../../utils';

const { object, string, bool } = Utils.yup;

const OPPGI_EN_BEGRUNNELSE = { melding: 'Oppgi en begrunnelse' };
const VELG_OM_ANMODNING_OM_MER_INFORMASJON_VIL_BLI_SENDT = { melding: 'Velg om anmodning om mer informasjon vil bli sendt' };
const DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN = 'Du kan ikke skrive mer enn 500 tegn';

const avslaa_utpeking = object().shape({
  begrunnelseUtenlandskMyndighet: string()
    .max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN)
    .required(OPPGI_EN_BEGRUNNELSE),
  vilSendeAnmodningOmMerInformasjon: bool()
    .required(VELG_OM_ANMODNING_OM_MER_INFORMASJON_VIL_BLI_SENDT),
  fritekst: string()
    .max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
});

export { avslaa_utpeking };
