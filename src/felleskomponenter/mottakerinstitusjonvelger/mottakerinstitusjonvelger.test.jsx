import { createStore, combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";

import { MottakerinstitusjonvelgerFlervalg } from "./mottakerinstitusjonvelger";

describe("MottakerinstutusjonvelgerFlervalg", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      feltnavn: "feltnavn",
      oppdaterKreverMottakerinstitusjon: vi.fn(),
      redigerbart: true,
      hentFelt: vi.fn(),
      form: "form",
      fields: {},
      bucType: "buctype",
    };
  });

  it("vises uten å krasje", () => {
    const store = createStore(combineReducers({ form: formReducer }));

    shallow(<MottakerinstitusjonvelgerFlervalg {...props} store={store} />);
  });
});
