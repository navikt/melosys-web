import * as Nav from "../../../navFrontend";

import EnkeltAvklartfakta from "./felles/enkeltAvklartfakta";

import MKV from "../../../melosyskodeverk";

import { VurderingForretningssted, Forretningssteder } from "./vurderingForretningssted";

describe("VurderingForretningssted", () => {
  const props = {
    bekreftOgFortsett: jest.fn(),
    tilbake: jest.fn(),
    tilstand: {
      omfattetINorge: {},
      omfattetILand: {},
      lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B,
      avklarteForretningsland: [],
      harAvklaring: false,
    },
    valgteVirksomheter: [
      {
        virksomhetId: "1",
        navn: "NAV",
      },
    ],
    redigerbart: true,
    oppdaterData: jest.fn(),
    slettData: jest.fn(),
  };

  describe("Forretningssteder", () => {
    const vurderingForretningssted = shallow(<VurderingForretningssted {...props} />);
    const forretningssteder = vurderingForretningssted.find(Forretningssteder);
    const forretningsstederProps = forretningssteder.props();

    it("vises med korrekte props", () => {
      expect(forretningssteder).toHaveLength(1);
      expect(forretningsstederProps.valgteVirksomheter).toBe(props.valgteVirksomheter);
      expect(forretningsstederProps.avklarteForretningsland).toEqual(props.tilstand.avklarteForretningsland);
      expect(forretningsstederProps.oppdaterData).toEqual(props.oppdaterData);
      expect(forretningsstederProps.slettData).toEqual(props.slettData);
      expect(forretningsstederProps.redigerbart).toEqual(props.redigerbart);
    });
  });

  describe("dropdown for lovvalgsbestemmelse", () => {
    const vurderingForretningssted = shallow(<VurderingForretningssted {...props} />);
    const lovvalgsbestemmelseDropdown = vurderingForretningssted.findWhere(
      (n) => n.type() === Nav.Select && n.props().id === "vurdering13_1"
    );
    const lovvalgsbestemmelseProps = lovvalgsbestemmelseDropdown.props();

    it("vises med korrekte props", () => {
      expect(lovvalgsbestemmelseDropdown).toHaveLength(1);
      expect(lovvalgsbestemmelseProps.value).toBe(props.tilstand.lovvalgsbestemmelse);
      expect(lovvalgsbestemmelseProps.disabled).toBe(!props.redigerbart);
    });

    it("håndterer change", () => {
      const event = {
        target: { value: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4 },
      };
      lovvalgsbestemmelseDropdown.simulate("change", event);

      expect(props.oppdaterData).toHaveBeenCalledTimes(1);
      expect(props.oppdaterData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          innhold: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4,
        })
      );
    });
  });

  describe("EnkeltAvklartfakta", () => {
    const vurderingForretningssted = shallow(<VurderingForretningssted {...props} />);
    const enkeltAvklartfakta = vurderingForretningssted.find(EnkeltAvklartfakta);
    const enkeltAvklartfaktaProps = enkeltAvklartfakta.props();

    it("vises med korrekte props", () => {
      expect(enkeltAvklartfakta).toHaveLength(1);
      expect(enkeltAvklartfaktaProps.redigerbart).toBe(props.redigerbart);
      expect(enkeltAvklartfaktaProps.avklartfakta).toBe(props.tilstand.omfattetINorge);
      expect(enkeltAvklartfaktaProps.oppdaterData).toBe(props.oppdaterData);
      expect(enkeltAvklartfaktaProps.slettData).toBe(props.slettData);
    });
  });
});
