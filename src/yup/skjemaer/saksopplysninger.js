import { object, array, string } from 'yup';

import * as KV from '../../kodeverk';

import MKV, { Utils as MKVUtils } from '../../melosyskodeverk';

const SLUTTDATO_ER_APEN = { melding: 'Sluttdato er åpen', panel: KV.Paneltitler.soknadsPeriode };

const erIkkeBeslutningLovvalgAnnetLand = behandlingstema => behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND;

const saksopplysninger = object().shape({
  foretakUtland: array().of(object().when('$behandlingstema', {
    is: erIkkeBeslutningLovvalgAnnetLand,
    then: object().shape({
      navn: string().nullable().required({ melding: 'Foretaksnavn kreves', panel: KV.Paneltitler.foretakUtland }),
    }),
  })),
  arbeidUtland: array().of(object().when('$behandlingstema', {
    is: erIkkeBeslutningLovvalgAnnetLand,
    then: object().shape({
      foretakNavn: string().nullable().required({ melding: 'Navn på foretak kreves', panel: KV.Paneltitler.arbeidUtland }),
      adresse: object().shape({
        landkode: string().nullable().required({ melding: 'Land kreves', panel: KV.Paneltitler.arbeidUtland }),
        poststed: string().nullable().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.arbeidUtland }),
      }),
    }),
  })),
  maritimtArbeid: array().of(object().when('$behandlingstema', {
    is: erIkkeBeslutningLovvalgAnnetLand,
    then: object().shape({
      enhetNavn: string().nullable().required({ melding: 'Navn kreves', panel: KV.Paneltitler.maritimtArbeid }),
    }).uniqueProperty('enhetNavn', { melding: 'Navn på enhet må være unikt', panel: KV.Paneltitler.maritimtArbeid }),
  })),
  oppgittAdresseGatenavn: string().nullable().when(['$skalOppgittAdresseValideres', '$behandlingstema'], {
    is: (oppgittAdresseSkalValideres, behandlingstema) => oppgittAdresseSkalValideres && erIkkeBeslutningLovvalgAnnetLand(behandlingstema),
    then: string().nullable().required({ melding: 'Gatenavn kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  oppgittAdressePostnummer: string().nullable().when(['$skalOppgittAdresseValideres', '$behandlingstema'], {
    is: (oppgittAdresseSkalValideres, behandlingstema) => oppgittAdresseSkalValideres && erIkkeBeslutningLovvalgAnnetLand(behandlingstema),
    then: string().nullable().required({ melding: 'Postnummer kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  oppgittAdressePoststed: string().nullable().when(['$skalOppgittAdresseValideres', '$behandlingstema'], {
    is: (oppgittAdresseSkalValideres, behandlingstema) => oppgittAdresseSkalValideres && erIkkeBeslutningLovvalgAnnetLand(behandlingstema),
    then: string().nullable().required({ melding: 'Poststed kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  oppgittAdresseLand: string().nullable().when(['$skalOppgittAdresseValideres', '$behandlingstema'], {
    is: (oppgittAdresseSkalValideres, behandlingstema) => oppgittAdresseSkalValideres && erIkkeBeslutningLovvalgAnnetLand(behandlingstema),
    then: string().nullable().required({ melding: 'Land kreves', panel: KV.Paneltitler.personopplysningspanel }),
  }),
  soknadsperiodeTom: string().when('$behandlingstema', {
    is: MKVUtils.erUtsendt,
    then: string().required(SLUTTDATO_ER_APEN),
  }),
});

export { saksopplysninger };
