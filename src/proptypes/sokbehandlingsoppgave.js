import PT from 'prop-types';

const SokBehandlingsOppgavePropType = PT.shape({
  fnr: PT.string,
  kjoenn: PT.string,
  registrertDato: PT.string,
  saksnummer: PT.string,
  sammensattNavn: PT.string,
  status: PT.string,
  type: PT.string,
});

const SokBehandlingsOppgaverPropType = PT.arrayOf(SokBehandlingsOppgavePropType);

export {
  SokBehandlingsOppgavePropType as SokBehandlingsOppgave,
  SokBehandlingsOppgaverPropType as SokBehandlingsOppgaver,
};
