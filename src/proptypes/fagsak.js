import PT from 'prop-types';

import { Kodeverk } from './kodeverk';
import { BehandligOversikt } from './behandlingOversikt';

const FagsakPropType = PT.shape({
  saksnummer: PT.string,
  sakstype: Kodeverk,
  saksstatus: Kodeverk,
  registrertDato: PT.string,
  endretDato: PT.string,
  gsakSaksnummer: PT.number,
  behandlingOversikter: PT.arrayOf(BehandligOversikt),
});

export { FagsakPropType as Fagsak };
