import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import MKV from "../../../../melosyskodeverk";
import VurderingArtikkel13_2b from "./vurderingArtikkel13_2b";

describe("vurderingArtikkel13_2b", () => {
  const props = (omfattesILandFaktaKode = MKV.Koder.landkoder.CY) => ({
    tilstand: {
      omfattesILandFakta: {
        fakta: [omfattesILandFaktaKode],
      },
      harAvklaring: true,
    },
    redigerbart: true,
    oppdaterData: vi.fn(),
    slettData: vi.fn(),
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
  });

  it("snapshot test dersom Norge ikke er valgt", () => {
    const { container } = render(<VurderingArtikkel13_2b {...props()} />);
    expect(screen.getByText("Velg land:")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("snapshot test dersom Norge er valgt", () => {
    const { container } = render(<VurderingArtikkel13_2b {...props(MKV.Koder.landkoder.NO)} />);
    expect(screen.queryByText("Velg land:")).toBeNull();
    expect(container).toMatchSnapshot();
  });
});
