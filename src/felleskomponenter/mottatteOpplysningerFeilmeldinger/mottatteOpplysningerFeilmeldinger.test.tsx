import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { MottatteOpplysningerFeilmeldinger } from "./mottatteOpplysningerFeilmeldinger";

describe("MottatteOpplysningerFeilmeldinger", () => {
  let props = null;

  beforeEach(() => {
    props = {
      panelFeil: [
        {
          panel: "Soknadsperiode",
          feil: ["Åpen sluttdato"],
        },
        {
          panel: "Personlig info",
          feil: ["Ugyldig fnr"],
        },
      ],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<MottatteOpplysningerFeilmeldinger {...props} />);
    expect(container).toMatchSnapshot();
  });
});
