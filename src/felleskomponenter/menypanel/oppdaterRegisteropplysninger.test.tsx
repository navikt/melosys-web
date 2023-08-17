import renderer from "react-test-renderer";
import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";

describe("oppdaterRegisteropplysninger", () => {
  it("snapshot test", () => {
    const tree = renderer
      .create(<OppdaterRegisteropplysninger oppdaterRegisteropplysninger={vi.fn()} sistOppdatert="2020-08-23" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
