import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import StegerstatterBase from "./stegerstatterBase";

describe("StegerstatterBase", () => {
  let props = null;

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
