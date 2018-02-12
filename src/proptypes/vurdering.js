import PT from 'prop-types';

const BetingelsePropType = PT.shape({
  krav: PT.string,
  resultat: PT.string,
});

const LovvalgsbestemmelsePropType = PT.shape({
  artikkel: PT.string,
  betingelser: PT.arrayOf(BetingelsePropType),
});

const FeilmeldingPropType = PT.shape({
  kategori: PT.string,
  alvorlighetsgrad: PT.string,
  feilmelding: PT.string,
});

const VurderingPropType = PT.shape({
  lovvalgsbestemmelser: PT.arrayOf(LovvalgsbestemmelsePropType),
  feilmeldinger: PT.arrayOf(FeilmeldingPropType),
});

export {
  LovvalgsbestemmelsePropType as Lovvalgsbestemmelse,
  FeilmeldingPropType as Feilmelding,
  VurderingPropType as Vurdering,
};
