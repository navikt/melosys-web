import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import Begrunnelser from "./begrunnelser";

describe("Begrunnelser", () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: "Begrunnelser",
      valgteBegrunnelser: ["KODE1", "KODE2", "KODE3"],
      muligeBegrunnelser: [
        { kode: "KODE1", term: "Term1" },
        { kode: "KODE3", term: "Term3" },
      ],
      fritekst: null,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Begrunnelser {...props} />);
    expect(container).toMatchSnapshot();
  });
});
