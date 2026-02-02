import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("./menylink", () => ({
  default: ({ label, onClick }: any) => (
    <li>
      <button onClick={onClick}>{label}</button>
    </li>
  ),
}));

vi.mock("../../bemUtils", () => ({
  default: () => ({ block: "linkgroup", element: () => "linkgroup__label" }),
}));

import LinkGroup from "./linkgroup";

describe("LinkGroup", () => {
  const links = [
    { label: "Inngang", active: true },
    { label: "Vedtak", active: false },
  ];

  it("rendrer alle linker", () => {
    render(<LinkGroup links={links} onClick={vi.fn()} />);
    expect(screen.getByText("Inngang")).toBeDefined();
    expect(screen.getByText("Vedtak")).toBeDefined();
  });

  it("rendrer label når gitt", () => {
    render(<LinkGroup links={links} onClick={vi.fn()} label="Steg" />);
    expect(screen.getByText("Steg")).toBeDefined();
  });

  it("rendrer ikke label når ikke gitt", () => {
    render(<LinkGroup links={links} onClick={vi.fn()} />);
    expect(screen.queryByText("Steg")).toBeNull();
  });

  it("kaller onClick med riktig index", () => {
    const onClick = vi.fn();
    render(<LinkGroup links={links} onClick={onClick} />);
    screen.getByText("Vedtak").click();
    expect(onClick).toHaveBeenCalledWith(1);
  });
});
