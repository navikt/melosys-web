import { act, render, screen } from "@testing-library/react";
import {
  Link,
  Route,
  Routes,
  UNSAFE_createMemoryHistory as createMemoryHistory,
  unstable_HistoryRouter as HistoryRouter,
} from "react-router";
import { medSkraastrekPaaRot } from "./historikk";
import { naviger } from "./navigator";
import { NavigeringRegistrering } from "./navigeringRegistrering";

const BASENAME = "/melosys";

const renderMedHistorikk = (startUrl: string) => {
  const minne = createMemoryHistory({
    initialEntries: [startUrl],
    v5Compat: true,
  });
  const historikk = medSkraastrekPaaRot(minne, BASENAME);
  const resultat = render(
    <HistoryRouter basename={BASENAME} history={historikk}>
      <NavigeringRegistrering />
      <Link to="/">Til forsiden</Link>
      <Link to="/sok?fnr=1">Til søk</Link>
      <Routes>
        <Route path="/" element={<div>Forside</div>} />
        <Route path="/sok" element={<div>Søk</div>} />
      </Routes>
    </HistoryRouter>,
  );
  return { minne, ...resultat };
};

describe("medSkraastrekPaaRot", () => {
  it("lager lenke til forsiden med avsluttende skråstrek", () => {
    const { unmount } = renderMedHistorikk("/melosys/sok");

    expect(screen.getByText("Til forsiden")).toHaveAttribute("href", "/melosys/");
    expect(screen.getByText("Til søk")).toHaveAttribute("href", "/melosys/sok?fnr=1");
    unmount();
  });

  it("navigerer til forsiden med avsluttende skråstrek", () => {
    const { minne, unmount } = renderMedHistorikk("/melosys/sok");
    expect(screen.getByText("Søk")).toBeInTheDocument();

    act(() => {
      naviger("/");
    });

    expect(minne.location.pathname).toBe("/melosys/");
    expect(screen.getByText("Forside")).toBeInTheDocument();
    unmount();
  });

  it("viser forsiden ved direkte åpning uten avsluttende skråstrek", () => {
    const { minne, unmount } = renderMedHistorikk("/melosys");

    expect(minne.location.pathname).toBe("/melosys");
    expect(screen.getByText("Forside")).toBeInTheDocument();
    unmount();
  });

  it("endrer ikke andre stier", () => {
    const { minne, unmount } = renderMedHistorikk("/melosys/");

    act(() => {
      naviger("/sok?fnr=1");
    });

    expect(minne.location.pathname).toBe("/melosys/sok");
    expect(minne.location.search).toBe("?fnr=1");
    unmount();
  });
});
