import PT from 'prop-types';
import * as MPT from './index';

const SakEnkeltLinjePropType = PT.shape({
  oppgaveID: PT.string,
  oppgavetype: MPT.Kodeverk,
  sammensattNavn: PT.string,
  saksnummer: PT.string,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    behandlingID: PT.string,
    behandlingType: MPT.Kodeverk,
    behandlingStatus: MPT.Kodeverk,
    endretDato: PT.string,
  }),
  aktivTil: PT.string,
  soknadsperiode: MPT.Periode,
  land: PT.array,
  journalpostID: PT.string,
  prioritet: PT.string,
  versjon: PT.number,
  ansvarligID: PT.string,
});

const MineOppgaverPropType = PT.arrayOf(SakEnkeltLinjePropType);

export {
  SakEnkeltLinjePropType as SakEnkeltLinje,
  MineOppgaverPropType as MineOppgaver,
};
