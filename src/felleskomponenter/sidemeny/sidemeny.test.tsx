import SideMeny from "./sidemeny";
import { render } from "@testing-library/react";
import { expect } from "vitest";

describe("SideMeny", () => {
  it("snapshot test", () => {
    const props = {
      linkGroups: [
        {
          label: "Sukker",
          links: [{ label: "Hvitt sukker" }, { label: "Brunt sukker" }],
        },
        {
          label: "Salt",
          links: [{ label: "Bordsalt" }],
        },
      ],
      onClick: () => {},
    };

    const { container } = render(<SideMeny {...props} />);
    expect(container).toMatchSnapshot();
  });
});
