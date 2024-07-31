import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import MKV from "../../melosyskodeverk";

const { FTRL, EU_EOS } = MKV.Koder.sakstyper;

describe("oppdaterRegisteropplysninger", () => {
  it("Skal vise alternativ for å se registeropplysninger 5 ekstra år tilbake i tid", () => {
    const { container } = renderWithProviders(
      <OppdaterRegisteropplysninger
        sakstype={FTRL}
        oppdaterRegisteropplysninger={vi.fn()}
        sistOppdatert="2020-08-23"
      />,
      {}
    );
    expect(container).toMatchSnapshot();
  });

  it("Skal ikke vise alternativ for å se registeropplysninger 5 ekstra år tilbake i tid", () => {
    const { container } = renderWithProviders(
      <OppdaterRegisteropplysninger
        sakstype={EU_EOS}
        oppdaterRegisteropplysninger={vi.fn()}
        sistOppdatert="2020-08-23"
      />,
      {}
    );
    expect(container).toMatchSnapshot();
  });
});
