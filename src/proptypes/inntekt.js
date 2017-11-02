import PT from 'prop-types';

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


export {
  InntektLinjePropType as InntektLinje,
  InntektPropType as Inntekt,
};
