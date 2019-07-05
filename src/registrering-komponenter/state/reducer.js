import avklartefaktaReducer from '../../ducks/avklartefakta/';
import { initialState as avklartefaktaInitialState } from '../../ducks/avklartefakta/reducers';
import behandlingerReducer from '../../ducks/behandlinger';
import { initialState as behandlingerInitialState } from '../../ducks/behandlinger/reducers';
import endrePeriodeReducer from './ducks/endrePeriode';
import { initialState as endrePeriodeInitialState } from './ducks/endrePeriode/reducers';
import fagsakerReducer from '../../ducks/fagsaker/';
import { initialState as fagsakerInitialState } from '../../ducks/fagsaker/reducers';
import lovvalgsperioderReducer from '../../ducks/lovvalgsperioder';
import { initialState as lovvalgsperioderInitialState } from '../../ducks/lovvalgsperioder/reducers';

export const initialState = {
  avklartefakta: avklartefaktaInitialState,
  behandlinger: behandlingerInitialState,
  endrePeriode: endrePeriodeInitialState,
  fagsaker: fagsakerInitialState,
  lovvalgsperioder: lovvalgsperioderInitialState,
};

export const reducer = ({
  avklartefakta, behandlinger, endrePeriode, fagsaker, lovvalgsperioder, soknad,
}, action) => ({
  avklartefakta: avklartefaktaReducer(avklartefakta, action),
  behandlinger: behandlingerReducer(behandlinger, action),
  endrePeriode: endrePeriodeReducer(endrePeriode, action),
  fagsaker: fagsakerReducer(fagsaker, action),
  lovvalgsperioder: lovvalgsperioderReducer(lovvalgsperioder, action),
});
