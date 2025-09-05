import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import React from "react";

import AvslaattPgaManglendeOpplysninger from "./avslaattPgaManglendeOpplysninger";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("AvslaattPgaManglendeOpplysninger", () => {
  it("Viser AvslaattPgaManglendeOpplysninger", () => {
    renderWithProviders(<AvslaattPgaManglendeOpplysninger />);

    expect(screen.getByText("Søknaden er avslått")).toBeInTheDocument();
  });
});
