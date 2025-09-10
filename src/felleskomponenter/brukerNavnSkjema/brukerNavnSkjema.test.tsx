import { describe, it, expect, vi, beforeEach } from "vitest";

import { BrukerNavnSkjema } from "./brukerNavnSkjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

interface Props {
  form: string;
  settFormBrukerNavn: ReturnType<typeof vi.fn>;
  resetFelter: ReturnType<typeof vi.fn>;
  className?: string;
  onChange?: () => void;
  formValues?: any;
}

describe("brukernavnskjema", () => {
  let props: Props;

  beforeEach(() => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
    global.fetch = mockFetch as any;

    props = {
      form: "Journalforing_SED",
      settFormBrukerNavn: vi.fn(),
      resetFelter: vi.fn(),
      className: "",
      onChange: vi.fn(),
      formValues: {},
    } as Props;
  });

  const WrappedBrukerNavnSkjema = reduxForm({ form: "test" })(BrukerNavnSkjema as any);

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedBrukerNavnSkjema {...props} />);
    expect(container).toMatchSnapshot();
  });
});
