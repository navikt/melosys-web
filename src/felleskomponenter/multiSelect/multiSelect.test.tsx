import { fireEvent, screen } from "@testing-library/react";
import MultiSelect from "./multiSelect";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

const props = {
  label: "Label",
  values: [],
  onChange: () => {},
  options: [
    { value: "SE", label: "Sverige" },
    { value: "DK", label: "Danmark" },
    { value: "FI", label: "Finland" },
  ],
};

describe("MultiSelect", () => {
  it("Props er satt", async () => {
    renderWithProviders(<MultiSelect {...props} />);

    const select = screen.getByRole("textbox");
    fireEvent.mouseDown(select);

    for (let i = 0; i < props.options.length; i += 1) {
      const option = props.options[i];
      const optionElement = await screen.findByText(option.label);
      expect(optionElement).toBeInTheDocument();
    }
  });

  it("Value er satt", () => {
    renderWithProviders(<MultiSelect {...props} values={["DK"]} />);

    expect(screen.getByText("Danmark")).toBeInTheDocument();
  });

  it("Label er vist", () => {
    renderWithProviders(<MultiSelect {...props} />);

    expect(screen.getByText(props.label)).toBeInTheDocument();
  });

  it("Feilmelding vises", () => {
    const errorMessage = "Error!";
    renderWithProviders(<MultiSelect {...props} feil={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
