import reducer from "./reducers";

import * as actions from "./actions";
import * as Utils from "../../services/utils";

interface OrganisasjonState {
  data: Array<{ orgnr: number }>;
  status?: string;
  resError?: any;
}

interface ExpectedState {
  data: Array<{ orgnr: number }>;
  status: string;
}

describe("organisasjoner reducer", () => {
  let initialState: OrganisasjonState;

  beforeEach(() => {
    initialState = {
      data: [],
    };
  });

  it("returnerer ny state med gamle og nye organisasjoner, status OK ved ok action", () => {
    initialState = {
      data: [{ orgnr: 810072512 }],
    };
    const data = { orgnr: 873152362 };

    const reducedState = reducer(initialState, actions.OK(data));
    expect(reducedState).toEqual({
      data: [{ orgnr: 810072512 }, { orgnr: 873152362 }],
      status: Utils.STATUS.OK,
    } as ExpectedState);
  });

  it("returnerer ny state ved ok action", () => {
    const data = { orgnr: 873152362 };

    const reducedState = reducer(initialState, actions.OK(data));
    expect(reducedState).toEqual({ data: [{ orgnr: 873152362 }], status: Utils.STATUS.OK } as ExpectedState);
  });

  it("returnerer ny state med status PENDING ved pending action", () => {
    const reducedState = reducer(initialState, actions.PENDING());
    expect(reducedState).toEqual({ data: [], status: Utils.STATUS.PENDING } as ExpectedState);
  });

  it("returnerer ny state med status ERROR ved feilet action, overskriver ikke eksisterende organisasjoner", () => {
    const data = {
      error: "Not found",
      status: 404,
    };

    const reducedState = reducer(initialState, actions.FEILET(data));

    expect(reducedState).toEqual({
      data: initialState.data,
      status: Utils.STATUS.ERROR,
      resError: data,
    });
  });
});
