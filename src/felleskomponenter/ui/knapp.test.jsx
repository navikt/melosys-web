import Knapp from "./knapp";
import { render } from "@testing-library/react";

describe("knapp", () => {
  let props = null;

  beforeEach(() => {
    props = {
      ikon: "Pencil",
      children: "child",
    };
  });

  it("viser en NAV knapp", () => {
    const { container } = render(<Knapp {...props} />);
    expect(container).toMatchSnapshot();
  });
});
