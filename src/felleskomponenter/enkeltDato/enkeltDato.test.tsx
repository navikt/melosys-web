import { ComponentProps } from "react";

import EnkeltDato from "./enkeltDato";
import { render, screen } from "@testing-library/react";

describe("EnkeltDato", () => {
  it("viser en dato med klokkeslett dersom dato er oppgitt og vistidspunkt er true", () => {
    const props = {
      dato: "2016-12-31",
      visTidspunkt: true,
    };
    render(<EnkeltDato {...props} />);
    const timeElement = screen.getByText(/31\.12\.2016 01:00/);
    expect(timeElement).toBeInTheDocument();
  });

  it("viser en dato uten klokkeslett dersom dato er oppgitt og vistidspunkt er false", () => {
    const props = {
      dato: "2016-12-31",
      visTidspunkt: false,
    };
    render(<EnkeltDato {...props} />);
    const timeElement = screen.getByText(/31\.12\.2016/);
    expect(timeElement).toBeInTheDocument();
    expect(screen.queryByText(/01:00/)).not.toBeInTheDocument();
  });

  it("viser bindestrek dersom dato ikke er oppgitt", () => {
    const props = {
      dato: undefined,
      visTidspunkt: true, // or false, depending on how component should behave
    };
    render(<EnkeltDato {...props} />);
    const dashElement = screen.getByText("-");
    expect(dashElement).toBeInTheDocument();
  });
});
