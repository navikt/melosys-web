import reducer from './reducers';

import * as actions from './actions';
import * as Utils from '../../services/utils';

describe('personer reducer', () => {
  let initialState = null;

  beforeEach(() => {
    initialState = {
      data: [],
    };
  });

  it('returnerer ny state med gamle og nye personer, status OK ved ok action', () => {
    initialState = {
      data: [
        { fnr: 17117802280 },
      ],
    };
    const data = { fnr: 19117220349 };

    const reducedState = reducer(initialState, actions.OK(data));
    expect(reducedState).toEqual({ data: [{ fnr: 17117802280 }, { fnr: 19117220349 }], status: Utils.STATUS.OK });
  });

  it('returnerer ny state ved ok action når initialState er satt til feilobjekt', () => {
    initialState = {
      data: {
        error: 'Not found',
        status: 404,
      },
    };
    const data = { fnr: 19117220349 };

    const reducedState = reducer(initialState, actions.OK(data));
    expect(reducedState).toEqual({ data: [{ fnr: 19117220349 }], status: Utils.STATUS.OK });
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
