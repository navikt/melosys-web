import React from "react";

import Orgnrinput from "./orgnrinput";

describe("Orgnrinput", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      onOrgnrFunnet: jest.fn(),
      defaultOrgnr: null,
      valideringer: [],
    };
  });

  it("vises uten å krasje", () => {
    shallow(<Orgnrinput {...props} />);
  });
});
