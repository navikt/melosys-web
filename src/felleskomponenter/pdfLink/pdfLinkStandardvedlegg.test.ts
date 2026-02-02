import { describe, it, expect } from "vitest";

import { lagPdfUrl } from "./pdfLinkStandardvedlegg";

describe("lagPdfUrl", () => {
  it("genererer korrekt URL fra standardvedlegg type", () => {
    const standardvedlegg = { type: "A1_VEDLEGG" } as any;
    expect(lagPdfUrl(standardvedlegg)).toBe("/api/dokumenter/v2/pdf/utkast/standardvedlegg/A1_VEDLEGG");
  });

  it("håndterer annen type", () => {
    const standardvedlegg = { type: "BREV_VEDLEGG" } as any;
    expect(lagPdfUrl(standardvedlegg)).toBe("/api/dokumenter/v2/pdf/utkast/standardvedlegg/BREV_VEDLEGG");
  });
});
