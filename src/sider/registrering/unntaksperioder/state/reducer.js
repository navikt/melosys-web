import avklartefaktaReducer, { initialState as avklartefaktaInitialState } from '../../../../ducks/avklartefakta';
import behandlingerReducer, { initialState as behandlingerInitialState } from '../../../../ducks/behandlinger';
import endrePeriodeReducer, { initialState as endrePeriodeInitialState } from './ducks/endrePeriode';
import fagsakerReducer, { initialState as fagsakerInitialState } from '../../../../ducks/fagsaker';
import lovvalgsperioderReducer, { initialState as lovvalgsperioderInitialState } from '../../../../ducks/lovvalgsperioder';
import soknadReducer, { initialState as soknadInitialState } from '../../../../ducks/soknad';

export const initialState = {
  avklartefakta: avklartefaktaInitialState,
  behandlinger: behandlingerInitialState,
  endrePeriode: endrePeriodeInitialState,
  fagsaker: fagsakerInitialState,
  lovvalgsperioder: lovvalgsperioderInitialState,
  soknad: soknadInitialState,
};

export const reducer = ({
  avklartefakta, behandlinger, endrePeriode, fagsaker, lovvalgsperioder, soknad,
}, action) => ({
  avklartefakta: avklartefaktaReducer(avklartefakta, action),
  behandlinger: behandlingerReducer(behandlinger, action),
  endrePeriode: endrePeriodeReducer(endrePeriode, action),
  fagsaker: fagsakerReducer(fagsaker, action),
  lovvalgsperioder: lovvalgsperioderReducer(lovvalgsperioder, action),
  soknad: soknadReducer(soknad, action),
});
