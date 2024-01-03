import { combineReducers, createStore } from "redux";
import { reducer as formReducer } from "redux-form";

import * as Mui from "../../../felleskomponenter/ui";
import * as Skjema from "../../../felleskomponenter/skjema";

import Dokumentliste from "../../../felleskomponenter/dokumentliste";
import { VurderingVideresend } from "./vurderingVideresend";

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("Vurderingvideresend", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      behandlingID: 4,
      videresendSoknad: vi.fn(),
      tilbake: vi.fn(),
      bostedsland: { kode: "SE", term: "Sverige" },
      handleSubmit: vi.fn(),
      form: "form",
      fysiskeDokument: [],
    };
  });

  it("viser fritekst til orienteringsbrev", () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    expect(
      vurderingVideresend.findWhere(
        (n) => n.type() === Skjema.Textarea && n.props().label === "Fritekst til orienteringsbrev"
      )
    ).toHaveLength(1);
  });

  it("viser en dokumentliste med korrekte props", () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    const dokumentliste = vurderingVideresend.find(Dokumentliste);
    const dokumentlisteProps = dokumentliste.props();

    expect(dokumentliste).toHaveLength(1);
    expect(dokumentlisteProps.behandlingID).toBe(props.behandlingID);
  });

  it("viser ikke dokumentliste dersom ikke redigerbart", () => {
    props.redigerbart = false;
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    expect(vurderingVideresend.find(Dokumentliste)).toHaveLength(0);
  });

  it("setter korrekte props for bekreftKnapp", () => {
    const store = createStore(combineReducers({ form: formReducer }));
    const vurderingVideresend = shallow(<VurderingVideresend {...props} store={store} />);
    const stegKnapper = vurderingVideresend.find(Mui.StegKnapper);

    expect(stegKnapper).toHaveLength(1);
    expect(stegKnapper.props().bekreftKnappProps.disabled).toBe(!props.redigerbart);
  });

  it("kaller videresendSoknad-prop ved submit av form", () => {
    const store = createStore(combineReducers({ form: formReducer }));
    const vurderingVideresend = shallow(<VurderingVideresend {...props} store={store} />);
    const form = vurderingVideresend.find("form");

    form.simulate("submit");

    expect(props.handleSubmit).toHaveBeenCalledTimes(1);
  });
});
