import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
// import React from "react"; // Not needed in React 17+

import { BrukerNavnSkjema } from "./brukerNavnSkjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
  mockReject: (error: Error) => void;
};

interface Props {
  form: string;
  settFormBrukerNavn: ReturnType<typeof vi.fn>;
  resetFelter: ReturnType<typeof vi.fn>;
}

describe("brukernavnskjema", () => {
  let props: Props;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      form: "Journalforing_SED",
      settFormBrukerNavn: vi.fn(),
      resetFelter: vi.fn(),
    } as Props;
  });

  const WrappedBrukerNavnSkjema = reduxForm({ form: "test" })(BrukerNavnSkjema);

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedBrukerNavnSkjema {...props} />);
    expect(container).toMatchSnapshot();
  });
});
