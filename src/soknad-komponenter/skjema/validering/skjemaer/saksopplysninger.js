import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';

const { object, array, string } = Utils.yup;

const saksopplysninger = object().shape({
  foretakUtland: array().of(object().shape({
    adresse: object().shape({
      postnummer: string().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.foretakUtland }),
      landkode: string().required({ melding: 'Land kreves', panel: KV.Paneltitler.foretakUtland }),
      poststed: string().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.foretakUtland }),
    }),
  })),
  arbeidUtland: array().of(object().shape({
    adresse: object().shape({
      postnummer: string().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.arbeidUtland }),
      landkode: string().required({ melding: 'Land kreves', panel: KV.Paneltitler.arbeidUtland }),
      poststed: string().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.arbeidUtland }),
    }),
  })),
  maritimtArbeid: array().of(object().shape({
    navn: string().required({ melding: 'Navn kreves', panel: KV.Paneltitler.maritimtArbeid }),
  }).uniqueProperty('navn', { melding: 'Navn må være unikt', panel: KV.Paneltitler.maritimtArbeid })),
});

export { saksopplysninger };
