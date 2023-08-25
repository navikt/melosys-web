import renderer from "react-test-renderer";
import { Faktura } from "./faktura";

describe("Faktura", () => {
  let props = null;

  beforeEach(() => {
    props = {
      faktura: {
        datoBestilt: "2023-08-24",
        fakturaLinje: [],
        id: 1,
        periodeFra: "2023-04-01",
        periodeTil: "2023-08-31",
        status: "BESTILLT",
      },
    };
  });

  it("snapshot test", () => {
    const tree = renderer.create(<Faktura {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
