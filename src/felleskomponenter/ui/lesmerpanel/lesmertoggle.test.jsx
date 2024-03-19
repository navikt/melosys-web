import LesMerToggle from "./lesmertoggle";
import { render, screen } from "@testing-library/react";

describe("LesMerToggle", () => {
  let props = null;

  beforeEach(() => {
    props = {
      erApen: true,
      lukkTekst: "Lukket",
      apneTekst: "Åpen",
      onClick: vi.fn(),
    };
  });

  it("viser lukkTekst når erApen=true", async () => {
    render(<LesMerToggle {...props} />);
    expect(screen.queryByText(props.apneTekst)).not.toBeInTheDocument();
    expect(screen.getByText(props.lukkTekst)).toBeInTheDocument();
  });

  it("viser apneTekst når erApen=false", async () => {
    props.erApen = false;
    render(<LesMerToggle {...props} />);
    expect(screen.queryByText(props.lukkTekst)).not.toBeInTheDocument();
    expect(screen.getByText(props.apneTekst)).toBeInTheDocument();
  });
});
