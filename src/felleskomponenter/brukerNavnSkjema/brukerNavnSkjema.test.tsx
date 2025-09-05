import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { BrukerNavnSkjema } from "./brukerNavnSkjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

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

  const WrappedBrukerNavnSkjema = reduxForm({ form: "test" })(BrukerNavnSkjema);

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedBrukerNavnSkjema {...props} />);
    expect(container).toMatchSnapshot();
  });
});
