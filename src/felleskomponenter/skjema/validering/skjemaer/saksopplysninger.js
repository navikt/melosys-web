import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';

const { object, array, string } = Utils.yup;

const saksopplysninger = object().shape({
  foretakUtland: array().of(object().shape({
    navn: string().nullable().required({ melding: 'Foretaksnavn kreves', panel: KV.Paneltitler.foretakUtland }),
  })),
  arbeidUtland: array().of(object().shape({
    adresse: object().shape({
      postnummer: string().nullable().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.arbeidUtland }),
      landkode: string().nullable().required({ melding: 'Land kreves', panel: KV.Paneltitler.arbeidUtland }),
      poststed: string().nullable().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.arbeidUtland }),
      gatenavn: string().nullable().required({ melding: 'Gatenavn kreves' }),
    }),
  })),
  maritimtArbeid: array().of(object().shape({
    enhetNavn: string().nullable().required({ melding: 'Navn kreves', panel: KV.Paneltitler.maritimtArbeid }),
  }).uniqueProperty('enhetNavn', { melding: 'Navn på enhet må være unikt', panel: KV.Paneltitler.maritimtArbeid })),
  oppgittAdresseGatenavn: string().nullable().when('$skalOppgittAdresseValideres', {
    is: true,
    then: string().nullable().required({ melding: 'Gatenavn kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  oppgittAdressePostnummer: string().nullable().when('$skalOppgittAdresseValideres', {
    is: true,
    then: string().nullable().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  oppgittAdressePoststed: string().nullable().when('$skalOppgittAdresseValideres', {
    is: true,
    then: string().nullable().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  oppgittAdresseLand: string().nullable().when('$skalOppgittAdresseValideres', {
    is: true,
    then: string().nullable().required({ melding: 'Land kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
});

export { saksopplysninger };
