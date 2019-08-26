import avklartefaktaReducer, { initialState as avklartefaktaInitialState } from '../../../../ducks/avklartefakta';
import behandlingerReducer, { initialState as behandlingerInitialState } from '../../../../ducks/behandlinger';
import fagsakerReducer, { initialState as fagsakerInitialState } from '../../../../ducks/fagsaker';
import lovvalgsperioderReducer, { initialState as lovvalgsperioderInitialState } from '../../../../ducks/lovvalgsperioder';
import soknadReducer, { initialState as soknadInitialState } from '../../../../ducks/soknad';

export const initialState = {
  avklartefakta: avklartefaktaInitialState,
  behandlinger: behandlingerInitialState,
  fagsaker: fagsakerInitialState,
  lovvalgsperioder: lovvalgsperioderInitialState,
  soknad: soknadInitialState,
};

export const reducer = ({
  avklartefakta, behandlinger, fagsaker, lovvalgsperioder, soknad,
}, action) => ({
  avklartefakta: avklartefaktaReducer(avklartefakta, action),
  behandlinger: behandlingerReducer(behandlinger, action),
  fagsaker: fagsakerReducer(fagsaker, action),
  lovvalgsperioder: lovvalgsperioderReducer(lovvalgsperioder, action),
  soknad: soknadReducer(soknad, action),
});
