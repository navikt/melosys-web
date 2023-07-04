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
        kode: "kode",
        term: "term",
        fjernbar: false,
        defaultFjernet: false,
      },
    ],
    onFjern: jest.fn(),
    onAngreFjern: jest.fn(),
    redigerbar: true,
  };

  it("snapshot test", () => {
    const tree = renderer.create(<Redigerbarliste {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
