import Input from "./input";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

const WrappedInput = reduxForm({ form: "test" })(Input);

describe("Input", () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: "test",
      meta: {
        error: "",
        touched: false,
        active: true,
      },
      feltNavn: "Test",
      navn: "Test",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedInput {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("viser ikke feilmelding", () => {
    props.meta = {
      error: "",
      touched: true,
      active: false,
    };
    const { queryByText } = renderWithProviders(<WrappedInput {...props} />);
    expect(queryByText("feilmelding")).not.toBeInTheDocument();
  });
});
