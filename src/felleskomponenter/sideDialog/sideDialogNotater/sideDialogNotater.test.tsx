import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

import SideDialogNotater from "./sideDialogNotater";

describe("SideDialogNotater", () => {
  let props: any;

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
