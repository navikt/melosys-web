import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import EnkeltLandPure from "./enkeltLandPure";

describe("EnkeltLandPure", () => {
  let props: any;

  beforeEach(() => {
    props = {
      landkoder: [
        { kode: "NO", term: "Norge" },
        { kode: "SE", term: "Sverige" },
      ],
      onChange: vi.fn(),
      value: "NO",
      label: "Test",
      bredde: "fullbredde",
    };
  });

  it("snapshot test", () => {
    const { container } = render(<EnkeltLandPure {...props} />);
    expect(container).toMatchSnapshot();
  });

  describe("ved fokus flyttet fra input", () => {
    it("hvis tekst ikke er skrevet inn, ikke vis feilmelding", () => {
      render(<EnkeltLandPure {...props} />);
      expect(screen.queryByText("Finner ikke landet du har skrevet inn.")).not.toBeInTheDocument();
    });

    it("hvis tekst er skrevet inn men landkoder prop ikke er oppgitt, vis feilmelding", async () => {
      props.landkoder = [];
      render(<EnkeltLandPure {...props} />);
      const user = userEvent.setup();

      const input = screen.getByRole("combobox");
      await user.clear(input);
      await userEvent.type(input, "Norge");
      await userEvent.tab();
      expect(screen.getByText("Finner ikke landet du har skrevet inn.")).toBeInTheDocument();
    });

    it("hvis tekst er skrevet inn og landkoder prop er oppgitt, oppdater inputverdi", async () => {
      render(<EnkeltLandPure {...props} />);
      const user = userEvent.setup();

      const input = screen.getByRole("combobox");
      await user.clear(input);
      await userEvent.type(input, "Norge");
      await userEvent.tab();
      expect(screen.getByDisplayValue("Norge (NO)")).toBeInTheDocument();
      expect(screen.queryByText("Finner ikke landet du har skrevet inn.")).not.toBeInTheDocument();
    });
  });
});
