import reducer from "./reducers";

import * as types from "./types";
import * as actions from "./actions";
import * as Utils from "../../services/utils";

import MKV from "../../melosyskodeverk";

interface VilkarItem {
  vilkaar: string;
}

interface VilkarState {
  data: VilkarItem[];
  status: string;
}

describe("vilkar reducer", () => {
  let initialState: VilkarState;

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
      status: Utils.STATUS.OK,
    };
    const reducedState = reducer(initialState as any, actions.resetState());

    expect(reducedState).toEqual({
      data: [
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
      ],
      status: Utils.STATUS.NOT_STARTED,
    } as VilkarState);
  });

  it(`overskriver ikke inngangsvilkaar ved ${types.OPPDATER_VILKAR}`, () => {
    initialState.data = [
      {
        vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      },
    ];

    const reducedState = reducer(initialState as any, actions.oppdaterState({}));

    expect(reducedState).toEqual({
      data: [
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
      ],
      status: Utils.STATUS.OK,
    } as VilkarState);
  });
});
