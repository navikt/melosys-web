import PT from 'prop-types';
import { Periode } from './periode';

const InntektListePropType = PT.arrayOf(PT.shape({
  opplysningspliktigID: PT.string,
  levereringstidspunkt: PT.string,
  utbetaltIPeriode: PT.string,
  inntektsperiodetype: PT.string,
  inntektskilde: PT.string,
  fordel: PT.string,
  beloep: PT.number,
  inntektsstatus: PT.string,
  utloeserArbeidsgiveravgift: PT.bool,
  opptjeningsland: PT.string,
  informasjonsstatus: PT.string,
  virksomhetID: PT.string,
  beskrivelse: PT.string,
  inntektsmottakerID: PT.string,
  inngaarIGrunnlagForTrekk: PT.bool,
  opptjeningsperiode: Periode,
}));

const ArbeidsInntektInformasjonPropType = PT.shape({
  inntektListe: InntektListePropType,
});

const ArbeidsInntektMaanedListePropType = PT.arrayOf(PT.shape({
  arbeidsInntektInformasjon: ArbeidsInntektInformasjonPropType,
  aarMaaned: PT.string,
}));

// ==============================================================

const ArbeidsforholdFrilanserListePropType = PT.arrayOf(PT.shape({
  frilansPeriode: Periode,
  yrke: PT.string,
}));
const FrilansInntektInformasjonPropType = PT.shape({
  arbeidsforholdFrilanserListe: ArbeidsforholdFrilanserListePropType,
});
const FrilansInntektMaanedListePropType = PT.arrayOf(PT.shape({
  frilansInntektInformasjon: FrilansInntektInformasjonPropType,
  aarMaaned: PT.string,
}));

const InntekterPrAarMaanedPropType = PT.arrayOf(PT.shape({
  opplysningspliktigID: PT.string,
  beloep: PT.number,
  aarMaaned: PT.string,
}));
// ==============================================================
const InntektPropType = PT.shape({
  arbeidsInntektMaanedListe: ArbeidsInntektMaanedListePropType,
  frilansInntektMaanedListe: FrilansInntektMaanedListePropType,
});

export {
  InntekterPrAarMaanedPropType as InntekterPrAarMaaned,
  InntektListePropType as InntektListe,
  InntektPropType as Inntekt,
};
