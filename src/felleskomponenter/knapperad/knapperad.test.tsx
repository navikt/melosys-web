import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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
});
