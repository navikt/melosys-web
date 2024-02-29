import RadioGruppe from "./radio-gruppe";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("RadioGruppe", () => {
  let props = null;
  const WrappedRadioGruppe = reduxForm({ form: "test" })(RadioGruppe);

  beforeEach(() => {
    props = {
      feltNavn: "",
      legend: "",
      label: "",
    };
  });

  it("snapshot test", () => {
    props.children = "children";
    props.feltNavn = "feltnavn";
    props.legend = "legend";
    props.label = "label";

    const { container } = renderWithProviders(<WrappedRadioGruppe {...props} />);
    expect(container).toMatchSnapshot();
  });
});
