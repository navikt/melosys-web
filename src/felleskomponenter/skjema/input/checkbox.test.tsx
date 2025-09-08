import { describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import Checkbox from "./checkbox";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";

describe("Checkbox", () => {
  let props: any;
  const WrappedCheckbox = reduxForm({ form: "test" })(Checkbox as any);

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
