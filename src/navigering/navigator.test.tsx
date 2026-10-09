import { vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { naviger, registrerNavigate } from "./navigator";
import { NavigeringRegistrering } from "./navigeringRegistrering";

describe("navigator", () => {
  it("kaller registrert navigate-funksjon", () => {
    const navigate = vi.fn();
    const avregistrer = registrerNavigate(navigate);

    naviger("/sok");

    expect(navigate).toHaveBeenCalledWith("/sok");
    avregistrer();
  });

  it("gjør ingenting når routeren ikke er montert", () => {
    const navigate = vi.fn();
    registrerNavigate(navigate)();

    expect(() => naviger("/")).not.toThrow();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("avregistrering fjerner ikke en nyere registrering", () => {
    const gammel = vi.fn();
    const ny = vi.fn();
    const avregistrerGammel = registrerNavigate(gammel);
    const avregistrerNy = registrerNavigate(ny);

    avregistrerGammel();
    naviger("/");

    expect(ny).toHaveBeenCalledWith("/");
    expect(gammel).not.toHaveBeenCalled();
    avregistrerNy();
  });

  it("navigerer i routeren via NavigeringRegistrering", () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <NavigeringRegistrering />
        <Routes>
          <Route path="/" element={<div>Forside</div>} />
          <Route path="/sok" element={<div>Søk</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Forside")).toBeInTheDocument();

    act(() => {
      naviger("/sok");
    });

    expect(screen.getByText("Søk")).toBeInTheDocument();

    unmount();
    expect(() => naviger("/")).not.toThrow();
  });
});
