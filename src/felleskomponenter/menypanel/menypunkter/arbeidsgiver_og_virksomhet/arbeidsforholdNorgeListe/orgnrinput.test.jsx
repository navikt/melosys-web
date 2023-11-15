import Orgnrinput from "./orgnrinput";
import { render } from "@testing-library/react";

vi.mock("../../../../../utils", async () => {
  const actual = await vi.importActual("../../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("Orgnrinput", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      onOrgnrFunnet: vi.fn(),
      defaultOrgnr: null,
      valideringer: [],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Orgnrinput {...props} />);
    expect(container).toMatchSnapshot();
  });
});
