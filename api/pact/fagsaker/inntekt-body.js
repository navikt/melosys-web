const { Matchers } = require('@pact-foundation/pact');

const { like, eachLike } = Matchers;

const arbeidsInntektMaanedListe = eachLike({
  aarMaaned: like('2018-01'),
  arbeidsInntektInformasjon: {
    inntektListe: eachLike({
      beloep: 25000,
      fordel: like('kontantytelse'),
      inntektskilde: like('A-ordningen'),
      inntektsperiodetype: 'Maaned',
      inntektsstatus: 'LoependeInnrapportert',
      levereringstidspunkt: '2018-02-01T10:09:38.7',
      utbetaltIPeriode: '2018-01',
      opplysningspliktigID: '912499693',
      virksomhetID: '912499693',
      inntektsmottakerID: '19117220349',
      inngaarIGrunnlagForTrekk: true,
      utloeserArbeidsgiveravgift: true,
      beskrivelse: 'fastloenn',
    }),
  },
});

const inntekt = {
  arbeidsInntektMaanedListe,
};

export default inntekt;
