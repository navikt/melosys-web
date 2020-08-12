import reducer from './reducers';

import * as types from './types';
import * as actions from './actions';
import * as Utils from '../../services/utils';

describe('utpekingsperioder reducer', () => {
  let initialState = null;

  beforeEach(() => {
    initialState = {
      data: [],
      status: Utils.STATUS.OK,
    };
  });

  it(`returnerer state med endret periode for ${types.ENDRE_PERIODE}`, () => {
    initialState = {
      data: [
        {
          fomDato: '11.11.2011',
          tomDato: '11.11.2012',
        },
      ],
      status: Utils.STATUS.OK,
    };

    const reducedState = reducer(initialState, actions.endrePeriode('01.01.2012', '01.01.2013'));

    expect(reducedState).toEqual({
      data: [
        {
          fomDato: '01.01.2012',
          tomDato: '01.01.2013',
        },
      ],
      status: Utils.STATUS.OK,
    });
  });
});
