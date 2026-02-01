import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("../../../tags", () => ({
  FraRegister: () => <span>Fra register</span>,
}));

vi.mock("../../../../../bemUtils", () => ({
  default: (block: string) => ({
    block,
    element: (el: string) => `${block}__${el}`,
  }),
}));

import VisFamilieMedlemmerFraRegisterKnapp from "./visFamilieMedlemmerFraRegisterKnapp";

describe("VisFamilieMedlemmerFraRegisterKnapp", () => {
  it("rendrer knappen med riktig tekst", () => {
    render(<VisFamilieMedlemmerFraRegisterKnapp onClick={vi.fn()} />);
    expect(screen.getByText("Vis familieforhold fra register")).toBeDefined();
  });

  it("kaller onClick med true ved klikk", () => {
    const onClick = vi.fn();
    render(<VisFamilieMedlemmerFraRegisterKnapp onClick={onClick} />);
    fireEvent.click(screen.getByText("Vis familieforhold fra register"));
    expect(onClick).toHaveBeenCalledWith(true);
  });
});
