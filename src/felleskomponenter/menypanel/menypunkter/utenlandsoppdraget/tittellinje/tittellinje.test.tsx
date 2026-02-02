import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Heading: ({ children, level, className }: { children: React.ReactNode; level: string; className: string }) => (
    <h2 className={className} data-level={level}>
      {children}
    </h2>
  ),
}));

vi.mock("../../../tags", () => ({
  ArbeidsgiversDel: ({ className }: { className: string }) => <span className={className}>ArbeidsgiversDel</span>,
}));

import Tittellinje from "./tittellinje";

describe("Tittellinje", () => {
  it("rendrer tittel", () => {
    render(<Tittellinje tittel="Oppdrag i Sverige" visArbeidsforholdRolleEtiketter={false} />);
    expect(screen.getByText("Oppdrag i Sverige")).toBeDefined();
  });

  it("viser arbeidsforhold-etikett når visArbeidsforholdRolleEtiketter er true", () => {
    render(<Tittellinje tittel="Test" visArbeidsforholdRolleEtiketter={true} />);
    expect(screen.getByText("ArbeidsgiversDel")).toBeDefined();
  });

  it("skjuler arbeidsforhold-etikett når visArbeidsforholdRolleEtiketter er false", () => {
    render(<Tittellinje tittel="Test" visArbeidsforholdRolleEtiketter={false} />);
    expect(screen.queryByText("ArbeidsgiversDel")).toBeNull();
  });
});
