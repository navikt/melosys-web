import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Knapperad from "./knapperad";

describe("Knapperad", () => {
  let props: any;

  beforeEach(() => {
    props = {
      bekreft: vi.fn(),
      bekreftTekst: "bekrefttekst",
      avbryt: vi.fn(),
      avbrytTekst: "avbryttekst",
      redigerbart: true,
      bekreftRedigerbart: true,
    };
  });

  it("sender tekst til riktig knapp", () => {
    render(<Knapperad {...props} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("bekrefttekst");
    expect(buttons[1]).toHaveTextContent("avbryttekst");
  });

  it("redigerbart-prop setter disabled korrekt", () => {
    props.redigerbart = false;
    render(<Knapperad {...props} />);

    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "bekrefttekst" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "avbryttekst" })).toBeDisabled();
  });

  it("bekreftRedigerbart-prop setter disabled korrekt", () => {
    props.bekreftRedigerbart = false;
    render(<Knapperad {...props} />);

    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "bekrefttekst" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "avbryttekst" })).toBeEnabled();
  });

  it("skal kalle bekreft callback når bekreft-knapp klikkes", async () => {
    const user = userEvent.setup();
    render(<Knapperad {...props} />);

    const bekreftKnapp = screen.getByRole("button", { name: "bekrefttekst" });
    await user.click(bekreftKnapp);

    expect(props.bekreft).toHaveBeenCalledTimes(1);
  });

  it("skal kalle avbryt callback når avbryt-knapp klikkes", async () => {
    const user = userEvent.setup();
    render(<Knapperad {...props} />);

    const avbrytKnapp = screen.getByRole("button", { name: "avbryttekst" });
    await user.click(avbrytKnapp);

    expect(props.avbryt).toHaveBeenCalledTimes(1);
  });

  it("skal vise spinner på bekreft-knapp når spinner er true", () => {
    props.spinner = true;
    render(<Knapperad {...props} />);

    const bekreftKnapp = screen.getByRole("button", { name: /bekrefttekst/ });
    expect(bekreftKnapp).toHaveClass("navds-button--loading");
  });

  it("skal ikke vise spinner når spinner er false eller undefined", () => {
    props.spinner = false;
    render(<Knapperad {...props} />);

    const bekreftKnapp = screen.getByRole("button", { name: "bekrefttekst" });
    expect(bekreftKnapp).not.toHaveClass("navds-button--loading");
  });

  it("skal håndtere size small på avbryt-knapp", () => {
    props.size = "small";
    render(<Knapperad {...props} />);

    const avbrytKnapp = screen.getByRole("button", { name: "avbryttekst" });
    expect(avbrytKnapp).toHaveClass("navds-button--small");
  });

  it("skal håndtere size medium på avbryt-knapp", () => {
    props.size = "medium";
    render(<Knapperad {...props} />);

    const avbrytKnapp = screen.getByRole("button", { name: "avbryttekst" });
    expect(avbrytKnapp).toHaveClass("navds-button--medium");
  });

  it("skal håndtere size xsmall på avbryt-knapp", () => {
    props.size = "xsmall";
    render(<Knapperad {...props} />);

    const avbrytKnapp = screen.getByRole("button", { name: "avbryttekst" });
    expect(avbrytKnapp).toHaveClass("navds-button--xsmall");
  });

  it("skal ha primary variant på bekreft-knapp", () => {
    render(<Knapperad {...props} />);

    const bekreftKnapp = screen.getByRole("button", { name: "bekrefttekst" });
    expect(bekreftKnapp).toHaveClass("navds-button--primary");
  });

  it("skal ha tertiary variant på avbryt-knapp", () => {
    render(<Knapperad {...props} />);

    const avbrytKnapp = screen.getByRole("button", { name: "avbryttekst" });
    expect(avbrytKnapp).toHaveClass("navds-button--tertiary");
  });

  it("skal ha CSS-klasse container__knapperad", () => {
    const { container } = render(<Knapperad {...props} />);

    expect(container.querySelector(".container__knapperad")).toBeInTheDocument();
  });

  it("skal håndtere manglende bekreft callback", () => {
    props.bekreft = undefined;
    render(<Knapperad {...props} />);

    expect(screen.getByRole("button", { name: "bekrefttekst" })).toBeInTheDocument();
  });

  it("skal håndtere manglende avbryt callback", () => {
    props.avbryt = undefined;
    render(<Knapperad {...props} />);

    expect(screen.getByRole("button", { name: "avbryttekst" })).toBeInTheDocument();
  });

  it("skal disable begge knapper når både redigerbart og bekreftRedigerbart er false", () => {
    props.redigerbart = false;
    props.bekreftRedigerbart = false;
    render(<Knapperad {...props} />);

    expect(screen.getByRole("button", { name: "bekrefttekst" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "avbryttekst" })).toBeDisabled();
  });

  it("skal enable avbryt-knapp selv om bekreftRedigerbart er false", () => {
    props.bekreftRedigerbart = false;
    render(<Knapperad {...props} />);

    expect(screen.getByRole("button", { name: "avbryttekst" })).not.toBeDisabled();
  });
});
