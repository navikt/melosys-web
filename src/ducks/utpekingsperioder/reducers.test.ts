import reducer from "./reducers";

import * as types from "./types";
import * as actions from "./actions";
import * as Utils from "../../services/utils";
import type { BasePeriode } from "../../services/modules/types/periodeTyper";

interface UtpekingsperiodeState {
  data: BasePeriode[];
  status: string;
}

describe("utpekingsperioder reducer", () => {
  let initialState: UtpekingsperiodeState;

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
          fomDato: "11.11.2011",
          tomDato: "11.11.2012",
        },
      ],
      status: Utils.STATUS.OK,
    };

    const reducedState = reducer(
      initialState as any,
      actions.endrePeriode("01.01.2012", "01.01.2013"),
    ) as UtpekingsperiodeState;

    expect(reducedState).toEqual({
      data: [
        {
          fomDato: "01.01.2012",
          tomDato: "01.01.2013",
        },
      ],
      status: Utils.STATUS.OK,
    } as UtpekingsperiodeState);
  });
});
