import { object, array, string } from 'yup';

import * as KV from '../../kodeverk';

import MKV, { Utils as MKVUtils } from '../../melosyskodeverk';

const lagMelding = (panel, undertittel, felt) => ({
  panel,
  undertittel,
  melding: felt,
});

const SLUTTDATO_ER_APEN = lagMelding(
  KV.Panel.periodeInntektOgFullmektig.tittel,
  KV.Panel.periodeInntektOgFullmektig.undertitler.soknadsPeriode,
  'Sluttdato er åpen'
);

const erIkkeBeslutningLovvalgAnnetLand = behandlingstema => behandlingstema !== MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND;

const utenlandskIdent = object().shape({
  ident: string().nullable().required(lagMelding(
    KV.Menypunkter.Person.tittel,
    KV.Menypunkter.Person.undertitler.utenlandskID,
    'Utenlandsk ID kreves'
  )),
  landkode: string().nullable().required(lagMelding(
    KV.Menypunkter.Person.tittel,
    KV.Menypunkter.Person.undertitler.utenlandskID,
    'Land for utenlandsk ID kreves'
  )),
});

const saksopplysninger = object().when('$behandlingstema', {
  is: erIkkeBeslutningLovvalgAnnetLand,
  then: object().shape({
    arbeidsforholdUtland: array().of(object().shape({
      navn: string().nullable().required(lagMelding(
        KV.Menypunkter.ArbeidsgiverOgvirksomhet.tittel,
        KV.Menypunkter.ArbeidsgiverOgvirksomhet.undertitler.arbeidsforholdIUtlandet,
        'Navn kreves'
      )),
    })),
    selvstendigNaeringsvirksomhetUtland: array().of(object().shape({
      navn: string().nullable().required(lagMelding(
        KV.Menypunkter.ArbeidsgiverOgvirksomhet.tittel,
        KV.Menypunkter.ArbeidsgiverOgvirksomhet.undertitler.selvstendigNaeringsdrivendeIUtlandet,
        'Navn kreves'
      )),
    })),
    arbeidsstedOffshore: array().of(object().shape({
      enhetNavn: string().nullable().required(lagMelding(
        KV.Panel.arbeidssteder.tittel,
        KV.Panel.arbeidssteder.undertitler.arbeidsstedOffshore,
        'Navn kreves'
      )),
    }).uniqueProperty('enhetNavn', lagMelding(
      KV.Panel.arbeidssteder.tittel,
      KV.Panel.arbeidssteder.undertitler.arbeidsstedOffshore,
      'Navn på enhet må være unikt'
    ))),
    arbeidsstedSkip: array().of(object().shape({
      enhetNavn: string().nullable().required(lagMelding(
        KV.Panel.arbeidssteder.tittel,
        KV.Panel.arbeidssteder.undertitler.arbeidsstedSkip,
        'Navn kreves'
      )),
    }).uniqueProperty('enhetNavn', lagMelding(
      KV.Panel.arbeidssteder.tittel,
      KV.Panel.arbeidssteder.undertitler.arbeidsstedSkip,
      'Navn på enhet må være unikt'
    ))),
    oppgittAdresseGatenavn: string().nullable().when('$skalOppgittAdresseValideres', {
      is: true,
      then: string().nullable().required(lagMelding(
        KV.Menypunkter.Person.tittel,
        KV.Menypunkter.Person.undertitler.annenAdresse,
        'Gatenavn kreves'
      )),
    }),
    oppgittAdressePostnummer: string().nullable().when('$skalOppgittAdresseValideres', {
      is: true,
      then: string().nullable().required(lagMelding(
        KV.Menypunkter.Person.tittel,
        KV.Menypunkter.Person.undertitler.annenAdresse,
        'Postnummer kreves'
      )),
    }),
    oppgittAdressePoststed: string().nullable().when('$skalOppgittAdresseValideres', {
      is: true,
      then: string().nullable().required(lagMelding(
        KV.Menypunkter.Person.tittel,
        KV.Menypunkter.Person.undertitler.annenAdresse,
        'Poststed kreves'
      )),
    }),
    oppgittAdresseLand: string().nullable().when('$skalOppgittAdresseValideres', {
      is: true,
      then: string().nullable().required(lagMelding(
        KV.Menypunkter.Person.tittel,
        KV.Menypunkter.Person.undertitler.annenAdresse,
        'Land kreves'
      )),
    }),
    soknadsperiodeTom: string().when('$behandlingstema', {
      is: MKVUtils.erUtsendt,
      then: string().required(SLUTTDATO_ER_APEN),
    }),
    utenlandskIdent: array().of(utenlandskIdent),
  }),
});

export { saksopplysninger };
