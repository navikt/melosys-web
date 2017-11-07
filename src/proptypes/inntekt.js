import PT from 'prop-types';

const InntektLinjePropType = PT.shape({
  beloep: PT.string,
  fordel: PT.string,
  inntektskilde: PT.string,
  inntektsperiodetype: PT.string,
  inntektsstatus: PT.string,
  levereringstidspunkt: PT.string,
  utbetaltIPeriode: PT.string,
  opplysningspliktigID: PT.string,
  virksomhetID: PT.string,
  inntektsmottakerID: PT.string,
  inngaarIGrunnlagForTrekk: PT.string,
  utloeserArbeidsgiveravgift: PT.bool,
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


export {
  InntektLinjePropType as InntektLinje,
  InntektPropType as Inntekt,
};
