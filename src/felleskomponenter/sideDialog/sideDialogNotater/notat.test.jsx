import Notat from "./notat";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Notat", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      tekst: "Testtekst",
      opprettetDato: "2019-04-23T10:02:52.031Z",
      endretDato: "2019-04-24T09:58:23.899Z",
      forfatter: "LILLA HEST",
      onUpdate: vi.fn(),
      overskrift: "Søknad",
      maksTekstLengde: 500,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Notat {...props} />);

    expect(container).toMatchSnapshot();
  });

  it("viser ikke endringsknapp hvis ikke redigerbar", () => {
    props.redigerbart = false;

    render(<Notat {...props} />);

    expect(screen.queryByText("Endre")).not.toBeInTheDocument();
  });

  it("skjuler knapp for lagring av tekst med flere tegn enn maksTekstLengde", async () => {
    props.maksTekstLengde = -1;

    render(<Notat {...props} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Endre"));
    expect(screen.queryByText("Lagre")).not.toBeInTheDocument();
    expect(screen.getByText("Avbryt")).toBeInTheDocument();
  });

  it("initialiserer tekstfelt med tekst fra prop", async () => {
    render(<Notat {...props} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Endre"));
    expect(screen.getByDisplayValue(props.tekst)).toBeInTheDocument();
  });

  it("resetter tekst i tekstfelt dersom man avbryter en endring", async () => {
    render(<Notat {...props} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Endre"));
    const input = screen.getByRole("textbox");
    user.clear(input);
    await userEvent.type(input, "Dette er en testsak");
    expect(screen.getByDisplayValue("Dette er en testsak")).toBeInTheDocument();

    await user.click(screen.getByText("Avbryt"));
    expect(screen.queryByText("Dette er en testsak")).not.toBeInTheDocument();
    expect(screen.getByText(props.tekst)).toBeInTheDocument();
  });

  it("viser ikke endretDato dersom opprettelsesDato og endretDato er like", () => {
    props.endretDato = "2019-04-23T10:02:52.031Z";
    render(<Notat {...props} />);

    expect(screen.queryByText("Endret:", { exact: false })).not.toBeInTheDocument();
  });
});
