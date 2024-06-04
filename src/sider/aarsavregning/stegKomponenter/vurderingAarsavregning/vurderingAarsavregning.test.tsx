import { render, screen } from "@testing-library/react";
import { VurderingAarsavregning } from "./vurderingAarsavregning";

describe("VurderingAarsavregning", () => {
  it("renders without crashing", () => {
    render(<VurderingAarsavregning />);
  });

  it("renders Årsavregning header", () => {
    render(<VurderingAarsavregning />);
    const headerElement = screen.getByText(/Årsavregning/i);
    expect(headerElement).toBeInTheDocument();
  });

  it("renders combobox with label År:", () => {
    render(<VurderingAarsavregning />);
    const comboboxElement = screen.getByLabelText(/År:/i);
    expect(comboboxElement).toBeInTheDocument();
  });

  it("renders Bekreft og fortsett button", () => {
    render(<VurderingAarsavregning />);
    const buttonElement = screen.getByRole("button", { name: /Bekreft og fortsett/i });
    expect(buttonElement).toBeInTheDocument();
  });
});
