import PeriodeForkorter from "./index";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

const WrappedPeriodeForkorter = reduxForm({ form: "test" })(PeriodeForkorter);

describe("PeriodeForkorter", () => {
  let props = null;

  beforeEach(() => {
    props = {
      checkboxClassName: "classname",
      redigerbart: true,
      checkboxFeltnavn: "forkortlovvalgsperiode",
      forkortPeriode: true,
      checkboxLabel: "Forkort lovvalgsperiode",
      onUncheck: vi.fn(),
      fomLabel: "Fra og med",
      fomFeltNavn: "fom",
      tomLabel: "Til og med",
      tomFeltNavn: "tom",
      fomRedigerbar: true,
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedPeriodeForkorter {...props} />);
    expect(container).toMatchSnapshot();
  });
});
