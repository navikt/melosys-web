import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PdfLink, { lagPdfUrl } from "./pdfLink";
import * as serviceUtils from "../../services/utils";

// Mock external link icon
vi.mock("../../resources/images", () => ({
  ExternalLink: () => <span data-testid="external-link-icon">External</span>,
}));

// Mock apnePdfINyFane
vi.mock("../../services/utils", () => ({
  apnePdfINyFane: vi.fn(),
}));

describe("PdfLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal rendre link med tittel", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    expect(screen.getByText(/Test dokument/)).toBeInTheDocument();
  });

  it("skal rendre external link ikon", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    expect(screen.getByTestId("external-link-icon")).toBeInTheDocument();
  });

  it("skal ha riktig aria-label", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Åpnes i ny fane");
  });

  it("skal ha riktig title attributt", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("title", "Åpnes i ny fane");
  });

  it("skal ha href '#'", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#");
  });

  it("skal kalle apnePdfINyFane med riktig URL når link klikkes", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    fireEvent.click(link);

    expect(serviceUtils.apnePdfINyFane).toHaveBeenCalledWith("/api/dokumenter/123/456", "Test dokument");
  });

  it("skal forhindre default link handling", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    link.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("skal håndtere ulike journalpostID", () => {
    render(<PdfLink journalpostID="999" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    fireEvent.click(link);

    expect(serviceUtils.apnePdfINyFane).toHaveBeenCalledWith("/api/dokumenter/999/456", "Test dokument");
  });

  it("skal håndtere ulike dokumentID", () => {
    render(<PdfLink journalpostID="123" dokumentID="789" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    fireEvent.click(link);

    expect(serviceUtils.apnePdfINyFane).toHaveBeenCalledWith("/api/dokumenter/123/789", "Test dokument");
  });

  it("skal håndtere ulike titler", () => {
    const { rerender } = render(<PdfLink journalpostID="123" dokumentID="456" tittel="Første tittel" />);

    expect(screen.getByText(/Første tittel/)).toBeInTheDocument();

    rerender(<PdfLink journalpostID="123" dokumentID="456" tittel="Andre tittel" />);

    expect(screen.getByText(/Andre tittel/)).toBeInTheDocument();
    expect(screen.queryByText(/Første tittel/)).not.toBeInTheDocument();
  });

  it("skal kalle apnePdfINyFane kun én gang per klikk", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    fireEvent.click(link);

    expect(serviceUtils.apnePdfINyFane).toHaveBeenCalledTimes(1);
  });

  it("skal kalle apnePdfINyFane ved flere klikk", () => {
    render(<PdfLink journalpostID="123" dokumentID="456" tittel="Test dokument" />);

    const link = screen.getByRole("link");
    fireEvent.click(link);
    fireEvent.click(link);
    fireEvent.click(link);

    expect(serviceUtils.apnePdfINyFane).toHaveBeenCalledTimes(3);
  });
});

describe("lagPdfUrl", () => {
  it("skal generere riktig URL med journalpostID og dokumentID", () => {
    const url = lagPdfUrl("123", "456");
    expect(url).toBe("/api/dokumenter/123/456");
  });

  it("skal håndtere ulike journalpostID", () => {
    expect(lagPdfUrl("999", "456")).toBe("/api/dokumenter/999/456");
    expect(lagPdfUrl("abc", "456")).toBe("/api/dokumenter/abc/456");
    expect(lagPdfUrl("jp-001", "456")).toBe("/api/dokumenter/jp-001/456");
  });

  it("skal håndtere ulike dokumentID", () => {
    expect(lagPdfUrl("123", "789")).toBe("/api/dokumenter/123/789");
    expect(lagPdfUrl("123", "xyz")).toBe("/api/dokumenter/123/xyz");
    expect(lagPdfUrl("123", "doc-001")).toBe("/api/dokumenter/123/doc-001");
  });

  it("skal håndtere spesialtegn i IDer", () => {
    expect(lagPdfUrl("123-abc", "456-xyz")).toBe("/api/dokumenter/123-abc/456-xyz");
  });

  it("skal alltid starte med /api/dokumenter/", () => {
    const url = lagPdfUrl("any", "id");
    expect(url).toMatch(/^\/api\/dokumenter\//);
  });

  it("skal ha fire deler separert med slash", () => {
    const url = lagPdfUrl("123", "456");
    const parts = url.split("/").filter((part) => part !== "");
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("api");
    expect(parts[1]).toBe("dokumenter");
    expect(parts[2]).toBe("123");
    expect(parts[3]).toBe("456");
  });
});
