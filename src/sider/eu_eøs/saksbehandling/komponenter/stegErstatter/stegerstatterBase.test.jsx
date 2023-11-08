import StegerstatterBase from "./stegerstatterBase";
import { render } from "@testing-library/react";

describe("StegerstatterBase", () => {
  let props = null;

  beforeEach(() => {
    props = {
      tittel: "Tittel",
      beskrivelse: "Beskrivelse",
    };
  });

  it("snapshot test", () => {
    const { container } = render(<StegerstatterBase {...props} />);
    expect(container).toMatchSnapshot();
  });
});
