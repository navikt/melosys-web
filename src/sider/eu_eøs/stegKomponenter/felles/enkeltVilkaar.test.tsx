import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EnkeltVilkaar from "./enkeltVilkaar";

const begrunnelser = [
  { kode: "KODE_A", term: "Begrunnelse A" },
  { kode: "KODE_B", term: "Begrunnelse B" },
];

describe("EnkeltVilkaar", () => {
  it("viser begrunnelser som checkboxer og sender valgte koder ved valg", async () => {
    const oppdaterData = vi.fn();
    render(
      <EnkeltVilkaar
        redigerbart
        vilkaar={{ oppfylt: false, begrunnelseKoder: [] }}
        vilkaarKode="vesentligVirksomhet"
        tittel="Har virksomheten vesentlig virksomhet i Norge?"
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        begrunnelser={begrunnelser}
        oppdaterData={oppdaterData}
      />,
    );

    await userEvent.click(screen.getByRole("checkbox", { name: "Begrunnelse B" }));

    expect(oppdaterData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        felt: "vesentligVirksomhet",
        innhold: expect.objectContaining({ begrunnelse: ["KODE_B"] }),
      }),
    );
  });
});
