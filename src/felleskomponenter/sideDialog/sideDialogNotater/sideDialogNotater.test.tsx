import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import SideDialogNotater from "./sideDialogNotater";

describe("SideDialogNotater", () => {
  let props: any;

  beforeEach(() => {
    // Mock fetch with proper Response object
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

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
