import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FANE_STATUS } from "../stegvelger";
import StegIkon from "./stegIkon";

describe("StegIkon", () => {
  it("bruker den synlige stegtittelen som tilgjengelig navn", () => {
    render(
      <ul>
        <StegIkon
          id="medlemskap"
          status={FANE_STATUS.UBEHANDLET}
          tittel="Vurdering <br />av medlemskap"
          onClick={vi.fn()}
        />
      </ul>,
    );

    expect(screen.getByRole("button", { name: "Vurdering av medlemskap" })).toBeInTheDocument();
  });
});
