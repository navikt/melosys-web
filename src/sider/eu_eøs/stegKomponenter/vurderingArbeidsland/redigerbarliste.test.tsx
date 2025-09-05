import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import Redigerbarliste from "./redigerbarliste";

describe("Redigerbarliste", () => {
  const props = {
    elementer: [
      {
        kode: "kode",
        term: "term",
        fjernbar: true,
        defaultFjernet: false,
      },
      {
        kode: "kode2",
        term: "term",
        fjernbar: false,
        defaultFjernet: false,
      },
    ],
    onFjern: vi.fn(),
    onAngreFjern: vi.fn(),
    redigerbar: true,
  };

  it("snapshot test", () => {
    const { container } = render(<Redigerbarliste {...props} />);
    expect(container).toMatchSnapshot();
  });
});
