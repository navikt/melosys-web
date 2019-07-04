/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const ArbeidNorgePropType = PT.shape({
  utsendendeOrgnr: PT.string,
  arbeidsforholdOpprettholdIHelePerioden: PT.bool,
  brukerErSelvstendigNaeringsdrivende: PT.bool,
  selvstendigFortsetterEtterArbeidIUtlandet: PT.bool,
  arbeidsforholdVikarNavn: PT.string,
  vikarOrgnr: PT.string,
  flyendePersonellHjemmebase: PT.string,
  ansattPaSokkelEllerSkip: PT.string,
  navnSkipEllerSokkel: PT.string,
  sokkelLand: PT.string,
  skipFartsomrade: PT.string,
  skipFlaggLand: PT.string,
  kontaktNavn: PT.string,
  kontaktEpost: PT.string,
  fullmektigFirma: PT.string,
  fullmektigAdresse: PT.string,
});

export { ArbeidNorgePropType as ArbeidNorge };
