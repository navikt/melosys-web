import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

import StegerstatterBase from "./stegerstatterBase";

describe("StegerstatterBase", () => {
  let props: any;

  beforeEach(() => {
    props = {
      tittel: "Tittel",
      beskrivelse: "Beskrivelse",
    };
  });

  it("snapshot test", () => {
    const { container } = render(<StegerstatterBase {...props} />);
    expect(container).toMatchSnapshot();
  });
});
