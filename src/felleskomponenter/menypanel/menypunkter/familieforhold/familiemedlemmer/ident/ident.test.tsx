import { render, screen } from "@testing-library/react";
import Ident from "./ident";

describe("Ident", () => {
  it("viser kopierbar ident", () => {
    const props = {
      ident: "11111111111",
    };
    render(<Ident {...props} />);

    const kopierbarTekst = screen.getByText(/11111111111/);
    expect(kopierbarTekst).toBeInTheDocument();
  });
});
