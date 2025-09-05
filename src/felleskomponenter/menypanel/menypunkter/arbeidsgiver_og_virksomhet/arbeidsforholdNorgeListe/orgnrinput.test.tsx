import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

import Orgnrinput from "./orgnrinput";

describe("Orgnrinput", () => {
  let props: any;

  beforeEach(() => {
    props = {
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      onOrgnrFunnet: vi.fn(),
      defaultOrgnr: "123",
      valideringer: [],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Orgnrinput {...props} />);
    expect(container).toMatchSnapshot();
  });
});
