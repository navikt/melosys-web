import * as Yup from 'yup';

import * as KV from '../../../../kodeverk';


const saksopplysninger = Yup.object().shape({
  foretakUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.foretakUtland }),
      landkode: Yup.string().required({ melding: 'Land kreves', panel: KV.Paneltitler.foretakUtland }),
      poststed: Yup.string().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.foretakUtland }),
    }),
  })),
  arbeidUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.arbeidUtland }),
      landkode: Yup.string().required({ melding: 'Land kreves', panel: KV.Paneltitler.arbeidUtland }),
      poststed: Yup.string().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.arbeidUtland }),
    }),
  })),
});

export { saksopplysninger };
