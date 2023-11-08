import Inntekt from "./inntekt";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("inntekt", () => {
  let props = null;

  beforeEach(() => {
    props = {
      inntektListe: [],
    };
  });

  it("viser ingenting ved tom inntektliste", () => {
    const { container } = render(<Inntekt {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("viser en graf dersom det finnes minst 1 inntekt", () => {
    props.inntektListe = [
      {
        beloep: 10000,
      },
    ];
    render(<Inntekt {...props} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("viser tabell ved klikk på knapp", async () => {
    props.inntektListe = [
      {
        beloep: 10000,
      },
    ];
    render(<Inntekt {...props} />);
    const user = userEvent.setup();
    await user.click(await screen.findByText("Vis grafen som tabell"));

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
