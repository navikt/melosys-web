import { object, array, string, addMethod } from 'yup';

import * as KV from '../../../../kodeverk';

/* eslint-disable */
addMethod(object, 'uniqueProperty', function (propertyName, message) {
  return this.test('unique', message, function (value) {
    if (!value || !value[propertyName]) {
      return true;
    }

    const { path } = this;
    const options = [...this.parent];
    const currentIndex = options.indexOf(value);

    const subOptions = options.slice(0, currentIndex);

    if (subOptions.some((option) => option[propertyName] === value[propertyName])) {
      throw this.createError({
        path: `${path}.${propertyName}`,
        message,
      });
    }

    return true;
  });
});
/* eslint-enable */

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
