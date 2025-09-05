import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

import MKV from "../../melosyskodeverk";

import { KodeTermCheckboxGroup } from "./index";

describe("KodeTermCheckboxGroup", () => {
  let props: any;

  beforeEach(() => {
    props = {
      legend: "Checkboxer",
      muligeValg: MKV.KTObjects.begrunnelser.arbeidsland,
      disabled: false,
      onChange: vi.fn(),
      defaultValg: [MKV.Koder.begrunnelser.arbeidsland.BASELAND],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<KodeTermCheckboxGroup {...props} />);
    expect(container).toMatchSnapshot();
  });
});
