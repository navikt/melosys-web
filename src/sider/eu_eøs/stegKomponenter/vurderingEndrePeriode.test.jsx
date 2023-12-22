import { VurderingEndrePeriode } from "./vurderingEndrePeriode";
import { lagAvklartfakta } from "../../../felleskomponenter/stegvelger";
import Datovelger from "../../../felleskomponenter/datovelger";

describe("vurderingEndrePeriode", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      behandlingID: 1,
      lovvalgsPeriode: {},
      endreLovvalgsperioderHandler: vi.fn(),
      endreVedtak: vi.fn(),
      tilForsiden: vi.fn(),
      tilbake: vi.fn(),
      redigerbart: true,
      tilstand: {
        aarsakEndringPeriodeAvklartfakta: lagAvklartfakta("a", "b", "c", [], "fritekst"),
      },
      oppdaterData: vi.fn(),
      oppdaterPeriode: vi.fn(),
      slettData: vi.fn(),
      soknadsland: ["SE"],
    };
  });

  it("viser en dokumentliste", () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find("Dokumentliste")).toHaveLength(1);
  });

  it("viser StegKnapper", () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find("StegKnapper")).toHaveLength(1);
  });

  describe("Bekreftelseknappen", () => {
    it("endrer periode når den trykkes", () => {
      const component = shallow(<VurderingEndrePeriode {...props} />);
      const stegKnapper = component.find("StegKnapper");
      component.instance().validerAlt = vi.fn(() => true);
      stegKnapper.props().bekreftKnappProps.onClick();
      expect(props.oppdaterPeriode).toHaveBeenCalled();
      expect(props.endreLovvalgsperioderHandler).toHaveBeenCalled();
    });
  });

  it("viser to datofelt for fradato og tildato", () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find(Datovelger)).toHaveLength(2);
  });
});
