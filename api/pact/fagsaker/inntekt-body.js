const { Matchers } = require('@pact-foundation/pact');

const { integer, like, eachLike } = Matchers;

const arbeidsInntektMaanedListe = eachLike({
  aarMaaned: like('2018-01'),
  arbeidsInntektInformasjon: {
    inntektListe: eachLike({
      beloep: integer(25000),
      fordel: like('kontantytelse'),
      inntektskilde: like('A-ordningen'),
      inntektsperiodetype: like('Maaned'),
      inntektsstatus: like('LoependeInnrapportert'),
      levereringstidspunkt: like('2018-02-01T10:09:38.7'),
      utbetaltIPeriode: like('2018-01'),
      opplysningspliktigID: like('912499693'),
      virksomhetID: like('912499693'),
      inntektsmottakerID: like('912499693'),
      inngaarIGrunnlagForTrekk: true,
      utloeserArbeidsgiveravgift: true,
      beskrivelse: like('fastloenn'),
    }),
  },
});

const inntekt = {
  arbeidsInntektMaanedListe,
};

export default inntekt;
