import { shallow } from "enzyme";

import * as Nav from "../../../navFrontend";
import Knapperad from "../../knapperad";
import { DialogboksAvslagSoknad } from "./dialogboksAvslagSoknad";

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("DialogboksAvslagSoknad", () => {
  const props = {
    avbryt: vi.fn(),
    avslaaSoknadHandle: vi.fn(),
    ariaHideApp: false,
    redigerbart: true,
    behandlingID: 1,
    dispatch: vi.fn(),
    kontrollerFerdigbehandling: vi.fn(),
    vedtakstype: null,
    feilmeldinger: [],
    kontrollfeil: [],
  };

  it("viser en Nav Modal", () => {
    const dialogboks = shallow(<DialogboksAvslagSoknad {...props} />);
    expect(dialogboks.exists(Nav.Modal)).toBe(true);
  });

  it("sender korrekt handler for avbryting til en knapperad", () => {
    const dialogboks = shallow(<DialogboksAvslagSoknad {...props} />);
    const knapperad = dialogboks.find(Knapperad);

    expect(knapperad).toHaveLength(1);

    const { avbryt } = knapperad.props();

    expect(avbryt).toBe(props.avbryt);
  });
});
