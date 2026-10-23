import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MKV from "../../melosyskodeverk";

import { KodeTermCheckboxGroup } from "./index";

describe("KodeTermCheckboxGroup", () => {
  let props: any;

  beforeEach(() => {
    props = {
      legend: "Checkboxer",
      muligeValg: MKV.KTObjects.begrunnelser.arbeidsland,
      disabled: false,
      onChange: vi.fn(),
      defaultValg: [MKV.Koder.begrunnelser.arbeidsland.BASELAND],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<KodeTermCheckboxGroup {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("sender valgte koder når defaultValg mangler", async () => {
    const [førsteValg, andreValg] = props.muligeValg;
    render(<KodeTermCheckboxGroup {...props} defaultValg={undefined} />);

    await userEvent.click(screen.getByRole("checkbox", { name: førsteValg.term }));
    await userEvent.click(screen.getByRole("checkbox", { name: andreValg.term }));

    expect(props.onChange).toHaveBeenLastCalledWith([førsteValg.kode, andreValg.kode]);
  });

  it("viser feilmelding", () => {
    render(<KodeTermCheckboxGroup {...props} error="Begrunnelse er påkrevd" />);
    expect(screen.getByText("Begrunnelse er påkrevd")).toBeInTheDocument();
  });

  it("fjerner avkrysninger når defaultValg nullstilles", async () => {
    const [førsteValg] = props.muligeValg;
    const { rerender } = render(<KodeTermCheckboxGroup {...props} defaultValg={[]} />);

    await userEvent.click(screen.getByRole("checkbox", { name: førsteValg.term }));
    expect(screen.getByRole("checkbox", { name: førsteValg.term })).toBeChecked();

    rerender(<KodeTermCheckboxGroup {...props} defaultValg={[]} />);

    expect(screen.getByRole("checkbox", { name: førsteValg.term })).not.toBeChecked();
  });
});
