import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { ArbeidsgivereNorge } from "./arbeidsgivereNorge";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("ArbeidsgivereNorge", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      arbeidsgivereNorge: [
        {
          organisasjon: { orgnr: "123" },
          arbeidsforhold: [],
          inntektListe: [],
          arbeidsforholdene: [],
        },
      ],
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<ArbeidsgivereNorge {...props} />);
    expect(container).toMatchSnapshot();
  });
});
