import reducer from "./reducers";

import * as types from "./types";
import * as actions from "./actions";
import * as Utils from "../../services/utils";

import MKV from "../../melosyskodeverk";

describe("vilkar reducer", () => {
  let initialState = null;

  beforeEach(() => {
    initialState = {
      data: [],
      status: Utils.STATUS.OK,
    };
  });

  it(`returnerer inngangsvilkaar og status ${Utils.STATUS.NOT_STARTED} ved ${types.RESET}`, () => {
    initialState = {
      data: [
        {
          vilkaar: "testvilkaar",
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

  it(`overskriver ikke inngangsvilkaar ved ${types.OPPDATER_VILKAR}`, () => {
    initialState.data = [
      {
        vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      },
    ];

    const reducedState = reducer(initialState, actions.oppdaterState({}));

    expect(reducedState).toEqual({
      data: [
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
      ],
      status: Utils.STATUS.OK,
    });
  });
});
