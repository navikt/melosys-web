import renderer from "react-test-renderer";
import Fakturainformasjon from "./fakturainformasjon";

describe("Fakturainformasjon", () => {
  it("snapshot test", () => {
    const tree = renderer.create(<Fakturainformasjon />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
