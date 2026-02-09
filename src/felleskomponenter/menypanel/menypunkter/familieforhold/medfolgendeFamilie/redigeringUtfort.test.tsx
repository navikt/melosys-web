import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Table: Object.assign(
    ({ children, className, size }: { children: React.ReactNode; className: string; size: string }) => (
      <table className={className} data-size={size}>
        {children}
      </table>
    ),
    {
      Header: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
      Body: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
      Row: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
      HeaderCell: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
      DataCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
    },
  ),
}));

vi.mock("../../../../../kodeverk", () => ({ Form: {} }));
let uuidCounter = 0;
vi.mock("../../../../../utils", () => ({ _uuid: () => `mock-uuid-${++uuidCounter}` }));

import RedigeringUtfort from "./redigeringUtfort";

describe("RedigeringUtfort", () => {
  it("rendrer tabell med familiemedlemmer", () => {
    const verdier = [
      { navn: "Kari Nordmann", fnr: "12345678901" },
      { navn: "Per Nordmann", fnr: "98765432100" },
    ] as any;

    render(<RedigeringUtfort verdier={verdier} />);
    expect(screen.getByText("Kari Nordmann")).toBeDefined();
    expect(screen.getByText("Per Nordmann")).toBeDefined();
    expect(screen.getByText("12345678901")).toBeDefined();
  });

  it("rendrer header med Navn og F.dato", () => {
    render(<RedigeringUtfort verdier={[]} />);
    expect(screen.getByText("Navn")).toBeDefined();
    expect(screen.getByText("F.dato/f.nr./d-nr.")).toBeDefined();
  });
});
