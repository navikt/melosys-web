import PT from 'prop-types';
import { Periode } from './periode';

const InntektEnkeltLinjePropType = PT.shape({
  beloep: PT.number,
  fordel: PT.string,
  inntektskilde: PT.string,
  inntektsperiodetype: PT.string,
  inntektsstatus: PT.string,
  levereringstidspunkt: PT.string,
  utbetaltIPeriode: PT.string,
  opplysningspliktigID: PT.string,
  opptjeningsperiode: Periode,
  virksomhetID: PT.string,
  inntektsmottakerID: PT.string,
  inngaarIGrunnlagForTrekk: PT.bool,
  utloeserArbeidsgiveravgift: PT.bool,
  beskrivelse: PT.string,
});

const InntektListePropType = PT.arrayOf(InntektEnkeltLinjePropType);

const InntektPropType = PT.shape({
  ident: PT.shape({
    personIdent: PT.string,
  }),
  arbeidsInntektIdent: PT.shape({
    arbeidsInntektMaaned: PT.shape({
      aarMaaned: PT.string,
      arbeidsInntektInformasjon: PT.shape({
        inntektListe: InntektEnkeltLinjePropType,
      }),
    }),
  }),
});

export {
  InntektEnkeltLinjePropType as InntektEnkeltLinje,
  InntektListePropType as InntektListe,
  InntektPropType as Inntekt,
};
