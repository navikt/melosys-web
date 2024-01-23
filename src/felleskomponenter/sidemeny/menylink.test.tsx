import { render, fireEvent } from "@testing-library/react";

import MenyLink from "./menylink";

describe("MenyLink", () => {
  let props = { onClick: vi.fn(), label: "test" };

  it("kaller onClick ved klikk på button", () => {
    const { getByText } = render(<MenyLink {...props} />);
    const button = getByText(props.label);

    fireEvent.click(button);

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
