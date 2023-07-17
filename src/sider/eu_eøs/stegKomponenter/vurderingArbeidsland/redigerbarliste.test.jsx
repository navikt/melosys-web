import renderer from "react-test-renderer";

import Redigerbarliste from "./redigerbarliste";

describe("Redigerbarliste", () => {
  const props = {
    elementer: [
      {
        kode: "kode",
        term: "term",
        fjernbar: true,
        defaultFjernet: false,
      },
      {
        kode: "kode2",
        term: "term",
        fjernbar: false,
        defaultFjernet: false,
      },
    ],
    onFjern: vi.fn(),
    onAngreFjern: vi.fn(),
    redigerbar: true,
  };

  it("snapshot test", () => {
    const tree = renderer.create(<Redigerbarliste {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
