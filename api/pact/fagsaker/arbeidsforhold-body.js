import periode from '../periode-body';

const { Matchers } = require('@pact-foundation/pact');

const {
  integer, decimal, iso8601Date, iso8601DateTimeWithMillis, like, eachLike,
} = Matchers;

const arbeidsavtale = {
  arbeidstidsordning: like(''),
  avloenningstype: like(''),
  yrke: like(''),
  beregnetAntallTimerPrUke: decimal(37.5),
  endringsdatoStillingsprosent: iso8601Date('1979-07-15'),
  maritimArbeidsavtale: false,
};

const arbeidsforholdet = {
  arbeidsforholdID: like('konvertert_97a38348-1041-4037-9ebe-f00aea12b1a8'),
  arbeidsforholdIDnav: integer(12345678),
  ansettelsesPeriode: periode,
  arbeidsforholdstype: like('Ordinært arbeidsforhold'),
  arbeidsavtaler: eachLike(arbeidsavtale, {
    min: 1,
  }),
  permisjonOgPermittering: [],
  utenlandsopphold: [],
  arbeidsgivertype: like('arbeidsgivertype'),
  arbeidsgiverID: like('873152362'),
  arbeidstakerID: like('19117220349'),
  opplysningspliktigtype: like('opplysningspliktigtype'),
  opplysningspliktigID: like('923609016'),
  opprettelsestidspunkt: iso8601DateTimeWithMillis('2018-01-24T12:57:33.587+01:00'),
  sistBekreftet: iso8601DateTimeWithMillis('2018-01-24T12:57:33.587+01:00'),
  Aordning: true,
};

const arbeidsforhold = eachLike(arbeidsforholdet, {
  min: 1,
});
export default arbeidsforhold;
