import PT from 'prop-types';
import * as MPT from './index';

const FagsakOppsummeringPropType = PT.shape({
  saksnummer: PT.string,
  sammensattNavn: PT.string,
  opprettetDato: PT.string,
  sakstype: MPT.Kodeverk,
  behandlingOversikt: PT.shape({
    behandlingID: PT.number,
    behandlingType: MPT.Kodeverk,
    opprettetDato: PT.string,
    behandlingsstatus: MPT.Kodeverk,
    soknadsperiode: MPT.Periode,
    land: PT.arrayOf(PT.string),
  }),
});

export { FagsakOppsummeringPropType as FagsakOppsummering };
