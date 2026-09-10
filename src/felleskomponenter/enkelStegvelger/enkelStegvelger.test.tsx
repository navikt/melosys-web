import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return {
    ...actual,
    useSelector: (selector: any) => selector(),
  };
});

vi.mock("../../ducks/redigerbart", () => ({
  redigerbartSelectors: { RedigerbartSelector: () => true },
}));

vi.mock("../../ducks/behandlinger", () => ({
  behandlingerSelectors: { BehandlingstypeKodeSelector: () => "" },
}));

vi.mock("../alertmeldinger", () => ({
  Innsynsmelding: () => null,
  NyVurderingMelding: () => null,
}));

vi.mock("../feilmeldinger", () => ({
  Feilmeldinger: () => null,
}));

vi.mock("../stegLinje/stegLinje", () => ({
  default: () => null,
}));

import EnkelStegvelger from "./enkelStegvelger";
import { FANE_STATUS } from "../stegvelger";

function StegA({ aktivtSteg, oppdaterStatus, bekreft }: any) {
  if (!aktivtSteg) return null;
  return (
    <div>
      <button onClick={() => oppdaterStatus(true, "B")}>Velg B</button>
      <button onClick={() => oppdaterStatus(true, "X")}>Velg X</button>
      <button onClick={bekreft}>BekreftA</button>
    </div>
  );
}

function StegB({ aktivtSteg, oppdaterStatus, bekreft, tilbake }: any) {
  if (!aktivtSteg) return null;
  return (
    <div>
      <button onClick={() => oppdaterStatus(true)}>FyllB</button>
      <button onClick={bekreft}>BekreftB</button>
      <button onClick={tilbake}>TilbakeB</button>
    </div>
  );
}

function StegC({ aktivtSteg, tilbake }: any) {
  if (!aktivtSteg) return null;
  return (
    <div>
      <button onClick={tilbake}>TilbakeC</button>
    </div>
  );
}

function StegX({ aktivtSteg }: any) {
  if (!aktivtSteg) return null;
  return <div>Innhold X</div>;
}

function lagAlleSteg() {
  return [
    {
      id: "A",
      tittel: "A",
      stegPosisjon: 0,
      status: FANE_STATUS.UBEHANDLET,
      aktivtSteg: true,
      vedtakSteg: false,
      komponent: StegA,
    },
    {
      id: "B",
      tittel: "B",
      stegPosisjon: 1,
      status: FANE_STATUS.UBEHANDLET,
      aktivtSteg: false,
      vedtakSteg: false,
      komponent: StegB,
    },
    {
      id: "C",
      tittel: "C",
      stegPosisjon: 2,
      status: FANE_STATUS.UBEHANDLET,
      aktivtSteg: false,
      vedtakSteg: false,
      komponent: StegC,
    },
    {
      id: "X",
      tittel: "X",
      stegPosisjon: 1,
      status: FANE_STATUS.UBEHANDLET,
      aktivtSteg: false,
      vedtakSteg: false,
      komponent: StegX,
    },
  ];
}

describe("EnkelStegvelger", () => {
  it("nullstiller ikke allerede utfylte steg lenger ned i flyten når man velger samme neste steg på nytt", () => {
    const { container } = render(<EnkelStegvelger alleSteg={lagAlleSteg()} />);

    // Bygg flyten A -> B -> C, og fyll ut B slik at C blir lagt til.
    fireEvent.click(screen.getByText("Velg B"));
    fireEvent.click(screen.getByText("BekreftA"));
    fireEvent.click(screen.getByText("FyllB"));
    fireEvent.click(screen.getByText("BekreftB"));

    // C skal nå finnes i flyten (aktivt steg).
    expect(container.querySelector("#C")).not.toBeNull();

    // Gå tilbake til A.
    fireEvent.click(screen.getByText("TilbakeC"));
    fireEvent.click(screen.getByText("TilbakeB"));

    // Velg "B" på nytt (samme neste steg som før, f.eks. via et annet radiovalg som også leder til B).
    fireEvent.click(screen.getByText("Velg B"));

    // B og C skal fortsatt finnes i flyten - de skal ikke nullstilles.
    expect(container.querySelector("#B")).not.toBeNull();
    expect(container.querySelector("#C")).not.toBeNull();
  });

  it("nullstiller senere steg når man velger en reell ny gren", () => {
    const { container } = render(<EnkelStegvelger alleSteg={lagAlleSteg()} />);

    // Bygg flyten A -> B -> C, og fyll ut B slik at C blir lagt til.
    fireEvent.click(screen.getByText("Velg B"));
    fireEvent.click(screen.getByText("BekreftA"));
    fireEvent.click(screen.getByText("FyllB"));
    fireEvent.click(screen.getByText("BekreftB"));
    expect(container.querySelector("#C")).not.toBeNull();

    // Gå tilbake til A.
    fireEvent.click(screen.getByText("TilbakeC"));
    fireEvent.click(screen.getByText("TilbakeB"));

    // Velg en reell ny gren (X i stedet for B).
    fireEvent.click(screen.getByText("Velg X"));

    // B og C skal nå være fjernet fra flyten, og X skal ha blitt lagt til.
    expect(container.querySelector("#B")).toBeNull();
    expect(container.querySelector("#C")).toBeNull();
    expect(container.querySelector("#X")).not.toBeNull();
  });
});
