import Orgnrinput from "./orgnrinput";

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

  it("vises uten å krasje", () => {
    shallow(<Orgnrinput {...props} />);
  });
});
