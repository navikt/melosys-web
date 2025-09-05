import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { Faktura } from "./faktura";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("Faktura", () => {
  let props = null;

  beforeEach(() => {
    props = {
      faktura: {
        datoBestilt: "2023-08-24",
        fakturaLinje: [],
        id: 1,
        periodeFra: "2023-04-01",
        periodeTil: "2023-08-31",
        status: "BESTILT",
      },
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(
      <table>
        <tbody>
          <Faktura {...props} />
        </tbody>
      </table>,
    );

    expect(container).toMatchSnapshot();
  });
});
