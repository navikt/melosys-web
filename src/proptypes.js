import PT from 'prop-types';


// Todo: Foreslår å gjøre eksport i BUNN, etter at alle propTypes er definert. Da slipper vi no-use-before-define-issues og kan gruppere litt friere.

const SaksbehandlerPropType = PT.shape({
  brukernavn: PT.string,
  navn: PT.string,
});

const BostedsAdressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string.isRequired,
    husnummer: PT.number.isRequired,
    husbokstav: PT.string,
  }),
  postnr: PT.string.isRequired,
  poststed: PT.string.isRequired,
  land: PT.string.isRequired,
});

const PersonPropType = PT.shape({
  fnr: PT.string,
  sivilstand: PT.string,
  statsborgerskap: PT.string,
  kjoenn: PT.string,
  fornavn: PT.string,
  etternavn: PT.string,
  sammensattNavn: PT.string,
  foedselsdato: PT.string,
  bostedsadresse: BostedsAdressePropType,
});

const PeriodePropType = PT.shape({
  fom: PT.string,
  tom: PT.string,
});

const ArbeidsavtalePropType = PT.shape({
  arbeidstidsordning: PT.string,
  avloenningstype: PT.string,
  yrke: PT.string,
  avtaltArbeidstimerPerUke: PT.number,
  stillingsprosent: PT.number,
  sisteLoennsendringsdato: PT.string,
  beregnetAntallTimerPrUke: PT.string,
  endringsdatoStillingsprosent: PT.string,
});

const OrgnummerNavnPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
});

const PermisjonOgPermitteringPropType = PT.shape({
  permisjonsId: PT.number,
  permisjonOgPermittering: PT.string,
  permisjonsprosent: PT.number,
  permisjonsPeriode: PeriodePropType,
});

const ArbeidsforholdPropType = PT.shape({
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

const InntektLinjePropType = PT.shape({
  beloep: PT.string,
  fordel: PT.string,
  inntektskilde: PT.string,
  inntektsperiodetype: PT.string,
  inntektsstatus: PT.string,
  levereringstidspunkt: PT.string,
  utbetaltIPeriode: PT.string,
  opplysningspliktig: PT.shape({
    orgnummer: PT.string,
  }),
  virksomhet: PT.shape({
    orgnummer: PT.string,
  }),
  tilleggsinformasjon: PT.shape({
    kategori: PT.string,
    tilleggsinformasjonDetaljer: PT.shape({
      etterbetalingsperiode: PT.shape({
        startDato: PT.string,
        sluttDato: PT.string,
      }),
    }),
  }),
  inntektsmottaker: PT.shape({
    personIdent: PT.string,
  }),
  inngaarIGrunnlagForTrekk: PT.string,
  utloeserArbeidsgiveravgift: PT.string,
  informasjonsstatus: PT.string,
  beskrivelse: PT.string,
});

const InntektPropType = PT.shape({
  ident: PT.shape({
    personIdent: PT.string,
  }),
  arbeidsInntektIdent: PT.shape({
    arbeidsInntektMaaned: PT.shape({
      aarMaaned: PT.string,
      arbeidsInntektInformasjon: PT.shape({
        inntektListe: InntektLinjePropType,
      }),
    }),
  }),
});

const ArbeidsforholdenePropType = PT.arrayOf(ArbeidsforholdPropType);

const ForretningsadressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string.isRequired,
  }),
  postnr: PT.string.isRequired,
  poststed: PT.string.isRequired,
  land: PT.string.isRequired,
});

const OrganisasjonPropType = PT.shape({
  orgnummer: PT.string,
  navn: PT.string,
  forretningsadresse: ForretningsadressePropType,
  postadresse: PT.string,
  kontakt: PT.shape({
    navn: PT.string.isRequired,
    telefon: PT.string.isRequired,
    epost: PT.string,
  }),
});

const OrganisasjonerPropType = PT.arrayOf(OrganisasjonPropType);


const KodeverkPropType = PT.shape({
  kode: PT.string,
  term: PT.string,
});
const MedlemskapPeriodePropType = PT.shape({
  id: PT.number,
  periode: PeriodePropType,
  meta: PT.shape({
    opprinneligOpprettetAv: PT.string,
    sistEndretAv: PT.string,
    tidspunktOpprinneligOpprettet: PT.string,
    tidspunktSistEndret: PT.string,
  }),
  version: PT.number,
  dato: PT.shape({
    registrert: PT.string,
    besluttet: PT.string,
  }),
  status: KodeverkPropType,
  helsedel: PT.bool,
  type: KodeverkPropType,
  lovvalg: KodeverkPropType,
  grunnlagstype: KodeverkPropType,
  land: KodeverkPropType,
  trygdedekning: KodeverkPropType,
  kildedokumenttype: KodeverkPropType,
  register: PT.string,
});
const MedlemskapPropType = PT.shape({
  aktorID: PT.string,
  periodeListe: PT.arrayOf(MedlemskapPeriodePropType),
});

const BekreftelserPropType = PT.shape({
  utsendt: PT.bool,
  ansatt: PT.bool,
  erstatter: PT.bool,
  over24m: PT.bool,
  arbeidsgiveravgift: PT.bool,
  trygdeavgift: PT.shape({
    trukket: PT.bool,
    tom: PT.string,
  }),
});

const OppsummeringPropType = PT.shape({
  behandlingsStatus: PT.shape({
    kode: PT.string,
    term: PT.string,
  }),
  opprettet: PT.string,
  sistOppdatert: PT.string,
});

export {
  SaksbehandlerPropType as Saksbehandler,
  BostedsAdressePropType as BostedsAdresse,
  PersonPropType as Person,
  PeriodePropType as Periode,
  ArbeidsavtalePropType as Arbeidsavtale,
  OrgnummerNavnPropType as OrgnummerNavn,
  PermisjonOgPermitteringPropType as PermisjonOgPermittering,
  ArbeidsforholdPropType as Arbeidsforhold,
  ArbeidsforholdenePropType as Arbeidsforholdene,
  OrganisasjonPropType as Organisasjon,
  OrganisasjonerPropType as Organisasjoner,
  MedlemskapPeriodePropType as MedlemskapPeriode,
  MedlemskapPropType as Medlemskap,
  BekreftelserPropType as Bekreftelser,
  InntektPropType as Inntekt,
  InntektLinjePropType as InntektLinje,
  OppsummeringPropType as Oppsummering,
};
