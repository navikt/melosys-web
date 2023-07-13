import * as Skjema from "../skjema";

import { BrukerNavnSkjema } from "./brukerNavnSkjema";

describe("brukernavnskjema", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      form: "Journalforing_SED",
      settFormBrukerNavn: vi.fn(),
      resetFelter: vi.fn(),
    };
  });

  it("viser en skjema.input", () => {
    const brukernavnskjema = shallow(<BrukerNavnSkjema {...props} />);

    expect(brukernavnskjema.find(Skjema.Input)).toHaveLength(1);
  });
});
