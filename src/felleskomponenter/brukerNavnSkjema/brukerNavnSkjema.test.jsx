import { BrukerNavnSkjema } from "./brukerNavnSkjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

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
