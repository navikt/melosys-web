import renderer from "react-test-renderer";

import RedigerbarListe from "./redigerbarliste";

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
    const tree = renderer.create(<RedigerbarListe {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
