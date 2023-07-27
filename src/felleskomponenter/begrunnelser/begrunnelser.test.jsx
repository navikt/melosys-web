import renderer from "react-test-renderer";

import Begrunnelser from "./begrunnelser";

describe("Begrunnelser", () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: "Begrunnelser",
      valgteBegrunnelser: ["KODE1", "KODE2", "KODE3"],
      muligeBegrunnelser: [
        { kode: "KODE1", term: "Term1" },
        { kode: "KODE3", term: "Term3" },
      ],
      fritekst: null,
    };
  });

  it("snapshot test", () => {
    const tree = renderer.create(<Begrunnelser {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
