import VedtakstypeSkjema from "./vedtakstypeskjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("Vedtaketypeskjema", () => {
  let props;
  const WrappedVedtakstypeSkjema = reduxForm({ form: "test" })(VedtakstypeSkjema);

  beforeEach(() => {
    props = {
      className: "artikkel",
      redigerbart: true,
      feltNavn: "feltNavn",
      label: "label",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVedtakstypeSkjema {...props} />);
    expect(container).toMatchSnapshot();
  });
});
