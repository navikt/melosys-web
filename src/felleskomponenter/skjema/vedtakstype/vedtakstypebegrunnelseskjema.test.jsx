import VedtakstypebegrunnelseSkjema from "./vedtakstypebegrunnelseskjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("VedtakstypebegrunnelseSkjema", () => {
  let props = null;
  const WrappedVedtakstypebegrunnelseSkjema = reduxForm({ form: "test" })(VedtakstypebegrunnelseSkjema);

  beforeEach(() => {
    props = {
      className: "artikkel",
      redigerbart: true,
      feltNavn: "feltNavn",
      label: "label",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVedtakstypebegrunnelseSkjema {...props} />);

    expect(container).toMatchSnapshot();
  });
});
