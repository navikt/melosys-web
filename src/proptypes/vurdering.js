import PT from 'prop-types';

const BetingelsePropType = PT.shape({
  krav: PT.string,
  resultat: PT.string,
});

const LovvalgsbestemmelsePropType = PT.shape({
  artikkel: PT.string,
  betingelser: PT.arrayOf(BetingelsePropType),
});

const LovvalgsbestemmelserPropType = PT.arrayOf(LovvalgsbestemmelsePropType);

const FeilmeldingPropType = PT.shape({
  kategori: PT.shape({
    alvorlighetsgrad: PT.string,
    beskrivelse: PT.string,
  }),
  melding: PT.string,
});

const FeilmeldingerPropType = PT.arrayOf(FeilmeldingPropType);

const VurderingPropType = PT.shape({
  lovvalgsbestemmelser: PT.arrayOf(LovvalgsbestemmelsePropType),
  feilmeldinger: PT.arrayOf(FeilmeldingPropType),
});

export {
  LovvalgsbestemmelsePropType as Lovvalgsbestemmelse,
  LovvalgsbestemmelserPropType as Lovvalgsbestemmelser,
  FeilmeldingPropType as Feilmelding,
  FeilmeldingerPropType as Feilmeldinger,
  VurderingPropType as Vurdering,
};
