import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../kodeverk", () => ({
  Menypunkter: { Fullmektig: { tittel: "Fullmektig" } },
}));

vi.mock("../../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("../../tags", () => ({
  ArbeidsgiversDel: () => <span>ArbeidsgiversDel</span>,
}));

vi.mock("../../../../services/api", () => ({
  Adresser: { hentOrganisasjonAdresse: vi.fn(), hentPersonAdresse: vi.fn() },
}));

vi.mock("./fullmektige", () => ({
  default: () => <div>Fullmektige</div>,
}));

vi.mock("../../../chevronKnapp/chevronKnapp", () => ({
  default: ({ label, onChange }: any) => <button onClick={onChange}>{label}</button>,
}));

vi.mock("./fullmektigHistorikk", () => ({
  default: () => <div>Historikk</div>,
}));

import Fullmektig from "./fullmektigcontainer";

describe("Fullmektigcontainer", () => {
  it("rendrer tittel og Fullmektige", () => {
    render(<Fullmektig redigerbart={true} visArbeidsforholdRolleEtiketter={false} />);
    expect(screen.getByText("Fullmektig")).toBeDefined();
    expect(screen.getByText("Fullmektige")).toBeDefined();
  });

  it("viser ArbeidsgiversDel-tag når visArbeidsforholdRolleEtiketter", () => {
    render(<Fullmektig redigerbart={true} visArbeidsforholdRolleEtiketter={true} />);
    expect(screen.getByText("ArbeidsgiversDel")).toBeDefined();
  });

  it("toggler historikk ved klikk", () => {
    render(<Fullmektig redigerbart={true} visArbeidsforholdRolleEtiketter={false} />);
    expect(screen.queryByText("Historikk")).toBeNull();
    fireEvent.click(screen.getByText("Vis historikk"));
    expect(screen.getByText("Historikk")).toBeDefined();
  });
});
