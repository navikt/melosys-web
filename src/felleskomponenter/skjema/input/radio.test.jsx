import Radio from "./radio";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

const WrappedRadio = reduxForm({ form: "test" })(Radio);

describe("Radio", () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: "Test",
      id: "1",
      input: {
        value: "",
        name: "Testname",
      },
      meta: {
        error: "",
        touched: false,
        active: true,
        dispatch: vi.fn(),
      },
      forhandsvalgt: false,
      label: "Test",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedRadio {...props} />);
    expect(container).toMatchSnapshot();
  });
});
