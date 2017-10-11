import PT from 'prop-types';

export const SaksbehandlerPropType = PT.shape({
  brukernavn: PT.string,
  navn: PT.string,
});

export const BostedsAdressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string.isRequired,
    husnummer: PT.number.isRequired,
    husbokstav: PT.string,
  }),
  postnr: PT.string.isRequired,
  poststed: PT.string.isRequired,
  land: PT.string.isRequired,
});

export const ForretningsadressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string.isRequired,
  }),
  postnr: PT.string.isRequired,
  poststed: PT.string.isRequired,
  land: PT.string.isRequired,
});

export const PersonPropType = PT.shape({
  fnr: PT.string.isRequired,
  sivilstand: PT.string,
  statsborgerskap: PT.string,
  kjoenn: PT.string,
  fornavn: PT.string,
  etternavn: PT.string,
  sammensattNavn: PT.string,
  foedselsdato: PT.string,
  bostedsadresse: BostedsAdressePropType,
});

export const PeriodePropType = PT.shape({
  fom: PT.string,
  tom: PT.string,
});

export const ArbeidsavtalePropType = PT.shape({
  arbeidstidsordning: PT.string,
  avloenningstype: PT.string,
  yrke: PT.string,
  avtaltArbeidstimerPerUke: PT.number,
  stillingsprosent: PT.number,
  sisteLoennsendringsdato: PT.string,
  beregnetAntallTimerPrUke: PT.number,
  endringsdatoStillingsprosent: PT.string,
});

export const OrgnummerNavnPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
});

export const PermisjonOgPermitteringPropType = PT.shape({
  permisjonsId: PT.number,
  permisjonOgPermittering: PT.string,
  permisjonsprosent: PT.number,
  permisjonsPeriode: PeriodePropType,
});

export const ArbeidsforholdPropType = PT.shape({
  arbeidsforholdID: PT.string,
  arbeidsforholdIDnav: PT.number,
  ansettelsesPeriode: PeriodePropType,
  arbeidsforholdstype: PT.string,
  permisjonOgPermittering: PT.array,
  utenlandsopphold: PT.array,
  arbeidsavtale: PT.arrayOf(ArbeidsavtalePropType),
  arbeidsgiver: OrgnummerNavnPropType,
  arbeidstakerID: PT.string,
  opplysningspliktig: OrgnummerNavnPropType,
  arbeidsforholdInnrapportertEtterAOrdningen: PT.bool,
});

export const OrganisasjonPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
  forretningsadresse: ForretningsadressePropType,
  postadresse: PT.string,
});
