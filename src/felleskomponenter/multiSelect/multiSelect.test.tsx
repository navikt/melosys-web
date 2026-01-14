import { fireEvent, screen } from "@testing-library/react";
import MultiSelect from "./multiSelect";
import { renderWithProviders, renderWithProvidersAsync } from "../../ducks/test-utils/renderWithProviders";

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
    await renderWithProvidersAsync(<MultiSelect {...props} />);

    const select = screen.getByRole("combobox");
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

  it("Tom label rendrer ikke label-element", () => {
    renderWithProviders(<MultiSelect {...props} label="" aria-label="Velg land" />);

    expect(screen.queryByLabelText("Label")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-label", "Velg land");
  });

  it("aria-label brukes når label er tom streng", () => {
    renderWithProviders(<MultiSelect {...props} label="" aria-label="Arbeidsland" />);

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-label", "Arbeidsland");
    expect(combobox).not.toHaveAttribute("aria-labelledby");
  });

  it("aria-labelledby settes når label har verdi", () => {
    renderWithProviders(<MultiSelect {...props} label="Velg land" />);

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-labelledby");
  });
});
