import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import AdministrasjonSide from "./administrasjonSide";
import { ADMIN_BASE, ADMIN_TEKSTBLOKKER } from "./ruter";

const featureToggle = vi.hoisted(() => ({ aktiv: true }));

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: () => featureToggle.aktiv,
}));

vi.mock("./oversikt/oversiktSide", () => ({
  default: () => <div>Oversikt-innhold</div>,
}));

vi.mock("../tekstblokker/tekstblokkerSide", () => ({
  default: () => <div>Tekstblokker-innhold</div>,
}));

const renderPå = (sti: string) =>
  render(
    <MemoryRouter initialEntries={[sti]}>
      <Routes>
        <Route path={`${ADMIN_BASE}/*`} element={<AdministrasjonSide />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AdministrasjonSide", () => {
  beforeEach(() => {
    featureToggle.aktiv = true;
  });

  it("viser oversikten på rotstien og markerer menypunktet som aktivt", () => {
    renderPå(ADMIN_BASE);

    expect(screen.getByText("Oversikt-innhold")).toBeInTheDocument();
    const oversikt = screen.getByRole("link", { name: "Oversikt" });
    expect(oversikt).toHaveClass("administrasjon__sidemeny-lenke--aktiv");
    expect(oversikt).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Brev- og tekstbibliotek" })).not.toHaveAttribute("aria-current");
  });

  it("viser tekstblokker på nøstet sti når toggle er på", () => {
    renderPå(ADMIN_TEKSTBLOKKER);

    expect(screen.getByText("Tekstblokker-innhold")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brev- og tekstbibliotek" })).toHaveClass(
      "administrasjon__sidemeny-lenke--aktiv",
    );
    expect(screen.getByRole("link", { name: "Oversikt" })).not.toHaveClass("administrasjon__sidemeny-lenke--aktiv");
  });

  it("viser ukjent side for tekstblokker når toggle er av", () => {
    featureToggle.aktiv = false;
    renderPå(ADMIN_TEKSTBLOKKER);

    expect(screen.queryByText("Tekstblokker-innhold")).not.toBeInTheDocument();
    expect(screen.getByText(/Denne siden finnes ikke/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Brev- og tekstbibliotek" })).not.toBeInTheDocument();
  });

  it("viser ukjent side for ukjent nøstet sti", () => {
    renderPå(`${ADMIN_BASE}/finnes-ikke`);

    expect(screen.getByText(/Denne siden finnes ikke: "\/administrasjon\/finnes-ikke"/)).toBeInTheDocument();
  });
});
