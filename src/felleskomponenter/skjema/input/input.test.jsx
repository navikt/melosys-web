import Input from "./input";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

const WrappedInput = reduxForm({ form: "test" })(Input);

describe("Input", () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: "test",
      bredde: "M",
      meta: {
        error: "",
        touched: false,
        active: true,
      },
      input: {},
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedInput {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("viser feilmelding", () => {
    props.meta = {
      error: "feilmelding",
      touched: true,
      active: false,
    };
    const { getByText } = renderWithProviders(<WrappedInput {...props} />);
    expect(getByText("feilmelding")).toBeInTheDocument();
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
