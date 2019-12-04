import MKV from '../../../../melosyskodeverk';

import * as Utils from '../../../../utils';

const { object, string } = Utils.yup;

const artikkel16_motta_svar = object().shape({
  endretPeriode: object()
    .when('$anmodningsperiodeSvarType', {
      is: MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE,
      then: object().shape({
        fom: string()
          .required({ melding: 'dato kreves' })
          .erGyldigDato({ melding: 'Ugyldig dato' }),
        tom: string()
          .required({ melding: 'dato kreves' })
          .erGyldigDato({ melding: 'Ugyldig dato' }),
      }),
    }),
});

export { artikkel16_motta_svar };
