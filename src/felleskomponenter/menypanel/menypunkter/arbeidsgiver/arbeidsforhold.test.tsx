import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import Arbeidsforhold from "./arbeidsforhold";

describe("arbeidsforhold", () => {
  const props = {
    arbeidsforholdene: [
      {
        arbeidsforholdID: "1234",
        ansettelsesPeriode: {
          fom: "2023-06-26",
          tom: "2023-08-01",
        },
        arbeidsgiver: {
          navn: "NAV",
          orgnr: "123",
        },
      },
    ],
  };

  it("snapshot test", () => {
    const { container } = render(<Arbeidsforhold {...props} />);

    expect(container).toMatchSnapshot();
  });
});
