import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import SideDialogNotater from "./sideDialogNotater";

describe("SideDialogNotater", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      saksnummer: "1",
      redigerbart: true,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<SideDialogNotater {...props} />);
    expect(container).toMatchSnapshot();
  });
});
