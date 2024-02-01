import Checkbox from "./checkbox";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("Checkbox", () => {
  let props = null;
  const WrappedCheckbox = reduxForm({ form: "test" })(Checkbox);

  beforeEach(() => {
    props = {
      feltNavn: "test",
      className: "",
      label: "Label",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedCheckbox {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("setter checked ved klikk", async () => {
    const { findByLabelText } = renderWithProviders(<WrappedCheckbox {...props} />);

    expect(await findByLabelText(props.label)).not.toBeChecked();
    const user = userEvent.setup();
    await user.click(await findByLabelText(props.label));
    expect(await findByLabelText(props.label)).toBeChecked();
  });
});
