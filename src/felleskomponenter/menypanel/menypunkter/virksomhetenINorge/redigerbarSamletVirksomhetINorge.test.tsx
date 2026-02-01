import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../skjema", () => ({
  Input: ({ label, feltNavn }: any) => <input aria-label={label} data-feltnavn={feltNavn} />,
}));

import RedigerbarSamletVirksomhetINorge from "./redigerbarSamletVirksomhetINorge";

describe("RedigerbarSamletVirksomhetINorge", () => {
  it("rendrer alle input-felter", () => {
    render(<RedigerbarSamletVirksomhetINorge />);
    expect(screen.getByLabelText("Antall ansatte")).toBeDefined();
    expect(screen.getByLabelText("Antall administrativt ansatte")).toBeDefined();
    expect(screen.getByLabelText("Antall utsendte arbeidstakere")).toBeDefined();
    expect(screen.getByLabelText("Andel ansatte rekruttert i Norge")).toBeDefined();
    expect(screen.getByLabelText("Andel omsetning opptjent i Norge")).toBeDefined();
    expect(screen.getByLabelText("Andel oppdragskontrakter inngått i Norge")).toBeDefined();
    expect(screen.getByLabelText("Andel oppdrag utført i Norge")).toBeDefined();
  });

  it("rendrer prosenttegn for andel-felter", () => {
    const { container } = render(<RedigerbarSamletVirksomhetINorge />);
    const percentSigns = container.querySelectorAll(".percent");
    expect(percentSigns).toHaveLength(4);
  });
});
