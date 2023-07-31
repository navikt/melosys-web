import * as Nav from "../../../../../navFrontend";
import * as Symboler from "../../symboler";

import SoknadsperiodeEndring from "./soknadsperiodeEndring";
import { Soknadsperiode } from "./soknadsperiode";

describe("Soknadsperiode", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      oppdaterPeriode: vi.fn(),
      lagreSoknadOgOppfriskSaksopplysninger: vi.fn(),
      soknadsperiodeFom: "12.12.2030",
      soknadsperiodeTom: "12.12.2033",
      tittel: "Tittel",
    };
  });

  it("viser nåværende søknadsperiode", () => {
    const soknadsperiode = shallow(<Soknadsperiode {...props} />);
    const element = soknadsperiode.find(Nav.Typo.Element);

    expect(element.children().first()).not.toBeNull();
  });

  it("viser symbol for å vise dialog for endring av periode, og dialog åpnes ved klikk", () => {
    const soknadsperiode = shallow(<Soknadsperiode {...props} />);
    const symbol = soknadsperiode.find(Symboler.Rediger);

    expect(symbol).toHaveLength(1);

    symbol.simulate("click");

    const soknadsperiodeEndring = soknadsperiode.find(SoknadsperiodeEndring);
    const soknadsperiodeEndringProps = soknadsperiodeEndring.props();

    expect(soknadsperiodeEndring).toHaveLength(1);

    expect(soknadsperiodeEndringProps.soknadsperiodeFom).toBe(props.soknadsperiodeFom);
    expect(soknadsperiodeEndringProps.soknadsperiodeTom).toBe(props.soknadsperiodeTom);
  });
});
