import reducer from './reducers';

import * as types from './types';
import * as actions from './actions';
import * as Utils from '../../services/utils';

import MKV from '../../melosyskodeverk';

describe('vilkar reducer', () => {
  let initialState = null;

  beforeEach(() => {
    initialState = {
      data: [],
    };
  });

  it(`returnerer inngangsvilkaar og status ${Utils.STATUS.NOT_STARTED} ved ${types.RESET}`, () => {
    initialState = {
      data: [
        {
          vilkaar: 'testvilkaar',
        },
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
      ],
    };
    const reducedState = reducer(initialState, actions.resetState());

    expect(reducedState).toEqual({
      data: [
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
      ],
      status: Utils.STATUS.NOT_STARTED,
    });
  });
});
