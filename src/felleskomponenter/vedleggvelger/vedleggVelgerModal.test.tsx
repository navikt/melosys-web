import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../navFrontend", () => ({
  Modal: Object.assign(
    ({ children, header }: any) => (
      <div>
        <span>{header?.heading}</span>
        {children}
      </div>
    ),
    {
      Body: ({ children }: any) => <div>{children}</div>,
      Footer: ({ children }: any) => <div>{children}</div>,
    },
  ),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("./vedleggVelgerTable", () => ({
  default: () => <div>VedleggTabell</div>,
}));

import VedleggVelgerModal from "./vedleggVelgerModal";

const defaultProps = {
  onRequestClose: vi.fn(),
  valgteVedlegg: {} as any,
  alleSaksvedlegg: [],
  slettSaksvedlegg: vi.fn(),
  slettStandardvedlegg: vi.fn(),
  leggTilSaksvedlegg: vi.fn(),
  velgStandardvedlegg: vi.fn(),
  standardvedlegg: [],
};

describe("VedleggVelgerModal", () => {
  it("rendrer heading og tabell", () => {
    render(<VedleggVelgerModal {...defaultProps} />);
    expect(screen.getByText("Dokumenter tilknyttet saken")).toBeDefined();
    expect(screen.getByText("VedleggTabell")).toBeDefined();
  });

  it("kaller onRequestClose ved klikk på Lukk", () => {
    const onClose = vi.fn();
    render(<VedleggVelgerModal {...defaultProps} onRequestClose={onClose} />);
    fireEvent.click(screen.getByText("Lukk"));
    expect(onClose).toHaveBeenCalled();
  });
});
