import { EnkeltArbeidsforholdUtland } from "./enkeltArbeidsforholdUtland";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../../../utils", async () => {
  const actual = await vi.importActual("../../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("EnkeltArbeidsforholdUtland", () => {
  let props = null;
  const WrappedEnkeltArbeidsforholdUtland = reduxForm({ form: "test" })(EnkeltArbeidsforholdUtland);

  beforeEach(() => {
    props = {
      redigerbart: true,
      overordnetFeltNavn: "feltnavn",
      className: "cssklasse",
      sakstype: "EU_EOS",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedEnkeltArbeidsforholdUtland {...props} />);
    expect(container).toMatchSnapshot();
  });
});
