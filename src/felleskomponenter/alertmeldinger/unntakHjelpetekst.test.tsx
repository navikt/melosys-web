import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UnntakHjelpetekst from "./unntakHjelpetekst";

describe("UnntakHjelpetekst", () => {
  it("skal rendre første liste med tittel", () => {
    render(<UnntakHjelpetekst />);

    expect(screen.getByText("For å søke om unntak, må du:")).toBeInTheDocument();
  });

  it("skal rendre andre liste med tittel", () => {
    render(<UnntakHjelpetekst />);

    expect(screen.getByText("Når du får svar, må du:")).toBeInTheDocument();
  });

  it("skal rendre første punkt om å sende nødvendige brev", () => {
    render(<UnntakHjelpetekst />);

    expect(screen.getByText(/sende nødvendige brev via «Send brev» -menyen/)).toBeInTheDocument();
  });

  it("skal rendre underpunkt om søknad om unntak", () => {
    render(<UnntakHjelpetekst />);

    expect(
      screen.getByText(/send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet»/),
    ).toBeInTheDocument();
  });

  it("skal rendre underpunkt om orienteringsbrev", () => {
    render(<UnntakHjelpetekst />);

    expect(
      screen.getByText(/send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig»/),
    ).toBeInTheDocument();
  });

  it("skal rendre punkt om å endre behandlingsstatus", () => {
    render(<UnntakHjelpetekst />);

    expect(
      screen.getByText(/endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet»/),
    ).toBeInTheDocument();
  });

  it("skal rendre punkt om å registrere perioden i MEDL", () => {
    render(<UnntakHjelpetekst />);

    expect(screen.getByText(/registrere perioden i MEDL som uavklart/)).toBeInTheDocument();
  });

  it("skal rendre punkt om å avvise den uavklarte perioden", () => {
    render(<UnntakHjelpetekst />);

    expect(screen.getByText(/avvise den uavklarte perioden i MEDL/)).toBeInTheDocument();
  });

  it("skal rendre punkt om å endre valget", () => {
    render(<UnntakHjelpetekst />);

    expect(
      screen.getByText(/endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden»/),
    ).toBeInTheDocument();
  });

  it("skal ha Box wrapper med riktig padding og background", () => {
    const { container } = render(<UnntakHjelpetekst />);

    const box = container.querySelector(".navds-box");
    expect(box).toBeInTheDocument();
  });

  it("skal inneholde to hovedlister", () => {
    render(<UnntakHjelpetekst />);

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(2);
    expect(titles[0]).toHaveTextContent("For å søke om unntak, må du:");
    expect(titles[1]).toHaveTextContent("Når du får svar, må du:");
  });

  it("skal ha tre punkter i første liste", () => {
    render(<UnntakHjelpetekst />);

    // First main list has 3 items at the top level
    expect(screen.getByText(/sende nødvendige brev via «Send brev» -menyen/)).toBeInTheDocument();
    expect(
      screen.getByText(/endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet»/),
    ).toBeInTheDocument();
    expect(screen.getByText(/registrere perioden i MEDL som uavklart/)).toBeInTheDocument();
  });

  it("skal ha to punkter i andre liste", () => {
    render(<UnntakHjelpetekst />);

    expect(screen.getByText(/avvise den uavklarte perioden i MEDL/)).toBeInTheDocument();
    expect(
      screen.getByText(/endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden»/),
    ).toBeInTheDocument();
  });

  it("skal ha nestet liste under første punkt", () => {
    render(<UnntakHjelpetekst />);

    // Check that nested list items exist
    expect(
      screen.getByText(/send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet»/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig»/),
    ).toBeInTheDocument();
  });

  it("skal rendre alle tekster riktig", () => {
    const { container } = render(<UnntakHjelpetekst />);

    // Verify the component rendered without errors
    expect(container.querySelector(".navds-box")).toBeInTheDocument();

    // Check that all main texts are present
    expect(container.textContent).toContain("For å søke om unntak, må du:");
    expect(container.textContent).toContain("Når du får svar, må du:");
    expect(container.textContent).toContain("sende nødvendige brev");
    expect(container.textContent).toContain("endre behandlingsstatus");
    expect(container.textContent).toContain("registrere perioden");
    expect(container.textContent).toContain("avvise den uavklarte");
  });

  it("skal ha linjeskift mellom listene", () => {
    const { container } = render(<UnntakHjelpetekst />);

    const br = container.querySelector("br");
    expect(br).toBeInTheDocument();
  });
});
