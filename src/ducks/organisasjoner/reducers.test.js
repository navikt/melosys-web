import reducer from './reducers';

import * as actions from './actions';
import * as Utils from '../../services/utils';
import * as BehandlingsgrunnlagActions from '../behandlingsgrunnlag/actions';

describe('organisasjoner reducer', () => {
  let initialState = null;

  beforeEach(() => {
    initialState = {
      data: [],
    };
  });

  it('returnerer ny state med gamle og nye organisasjoner, status OK ved ok action', () => {
    initialState = {
      data: [
        { orgnr: 810072512 },
      ],
    };
    const data = { orgnr: 873152362 };

    const reducedState = reducer(initialState, actions.OK(data));
    expect(reducedState).toEqual({ data: [{ orgnr: 810072512 }, { orgnr: 873152362 }], status: Utils.STATUS.OK });
  });

  it('returnerer ny state ved behandlingsgrunnlag/ok action når initialState er satt til feilobjekt', () => {
    initialState = {
      data: {
        error: 'Not found',
        status: 404,
      },
    };
    const data = {
      tilleggsData: {
        organisasjoner: [
          { orgnr: 873152362 },
        ],
      },
    };

    const reducedState = reducer(initialState, BehandlingsgrunnlagActions.OK(data));
    expect(reducedState).toEqual({ data: [{ orgnr: 873152362 }], status: Utils.STATUS.OK });
  });

  it('returnerer ny state ved ok action når initialState er satt til feilobjekt', () => {
    initialState = {
      data: {
        error: 'Not found',
        status: 404,
      },
    };
    const data = { orgnr: 873152362 };

    const reducedState = reducer(initialState, actions.OK(data));
    expect(reducedState).toEqual({ data: [{ orgnr: 873152362 }], status: Utils.STATUS.OK });
  });

  it('returnerer ny state med status PENDING ved pending action', () => {
    const reducedState = reducer(initialState, actions.PENDING());
    expect(reducedState).toEqual({ data: [], status: Utils.STATUS.PENDING });
  });

  it('returnerer ny state med status ERROR ved feilet action', () => {
    const data = {
      error: 'Not found',
      status: 404,
    };

    const reducedState = reducer(initialState, actions.FEILET(data));
    expect(reducedState).toEqual({ data, status: Utils.STATUS.ERROR });
  });
});
