import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import AvslaattPgaManglendeOpplysninger from "./avslaattPgaManglendeOpplysninger";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("AvslaattPgaManglendeOpplysninger", () => {
  it("Viser AvslaattPgaManglendeOpplysninger", () => {
    renderWithProviders(<AvslaattPgaManglendeOpplysninger />);

    expect(screen.getByText("Søknaden er avslått")).toBeInTheDocument();
  });
});
