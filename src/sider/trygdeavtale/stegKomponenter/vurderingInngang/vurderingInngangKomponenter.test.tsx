import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandValgSomOptions } from "./vurderingInngangKomponenter";

describe("LandValgSomOptions", () => {
  it("rendrer options fra landValg", () => {
    const landValg = [
      { kode: "NO", term: "Norge" },
      { kode: "SE", term: "Sverige" },
    ];
    render(
      <select>
        <LandValgSomOptions landValg={landValg} />
      </select>,
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0].textContent).toBe("Norge");
    expect(options[1].textContent).toBe("Sverige");
  });

  it("returnerer null for undefined landValg", () => {
    const { container } = render(
      <select>
        <LandValgSomOptions landValg={undefined as any} />
      </select>,
    );
    expect(container.querySelectorAll("option")).toHaveLength(0);
  });

  it("rendrer tom liste for tomt array", () => {
    const { container } = render(
      <select>
        <LandValgSomOptions landValg={[]} />
      </select>,
    );
    expect(container.querySelectorAll("option")).toHaveLength(0);
  });
});
