import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MultiSelect from "./multiSelect";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

const options = [
  { value: "SE", label: "Sverige" },
  { value: "DK", label: "Danmark" },
  { value: "FI", label: "Finland" },
];

const props = {
  label: "Land",
  values: [] as string[],
  onChange: () => {},
  options,
};

describe("MultiSelect", () => {
  it("viser alle valg når listen åpnes", async () => {
    renderWithProviders(<MultiSelect {...props} />);

    await userEvent.click(screen.getByRole("combobox", { name: "Land" }));

    for (const option of options) {
      expect(screen.getByRole("option", { name: option.label })).toBeInTheDocument();
    }
  });

  it("legger til valgt verdi og beholder eksisterende i valgt rekkefølge", async () => {
    const onChange = vi.fn();
    renderWithProviders(<MultiSelect {...props} values={["FI"]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox", { name: "Land" }));
    await userEvent.click(screen.getByRole("option", { name: "Sverige" }));

    expect(onChange).toHaveBeenCalledWith([options[2], options[0]]);
  });

  it("fjerner verdi som velges bort", async () => {
    const onChange = vi.fn();
    renderWithProviders(<MultiSelect {...props} values={["SE", "DK"]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox", { name: "Land" }));
    await userEvent.click(screen.getByRole("option", { name: "Sverige" }));

    expect(onChange).toHaveBeenCalledWith([options[1]]);
  });

  it("viser valgte verdier", () => {
    renderWithProviders(<MultiSelect {...props} values={["DK"]} />);

    expect(screen.getByRole("button", { name: "Danmark slett" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sverige slett" })).not.toBeInTheDocument();
  });

  it("viser feilmelding", () => {
    renderWithProviders(<MultiSelect {...props} feil="Du må velge land" />);

    expect(screen.getByText("Du må velge land")).toBeInTheDocument();
  });

  it("bruker aria-label som skjult label når label er tom", () => {
    renderWithProviders(<MultiSelect {...props} label="" aria-label="Arbeidsland" />);

    expect(screen.getByRole("combobox", { name: "Arbeidsland" })).toBeInTheDocument();
  });

  it("er deaktivert når redigerbart er false", () => {
    renderWithProviders(<MultiSelect {...props} redigerbart={false} />);

    expect(screen.getByRole("combobox", { name: "Land" })).toBeDisabled();
  });
});
