import Orgnrinput from "./orgnrinput";
import { render } from "@testing-library/react";

describe("Orgnrinput", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      onOrgnrFunnet: vi.fn(),
      defaultOrgnr: "123",
      valideringer: [],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Orgnrinput {...props} />);
    expect(container).toMatchSnapshot();
  });
});
