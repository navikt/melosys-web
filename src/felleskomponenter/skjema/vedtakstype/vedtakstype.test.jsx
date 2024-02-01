import Vedtakstype from "./index";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("Vedtakstype", () => {
  let props = null;
  const WrappedVedtakstype = reduxForm({ form: "test" })(Vedtakstype);

  beforeEach(() => {
    props = {
      className: "artikkel",
      redigerbart: true,
      vedtakstypeFeltNavn: "vedtakstypeFeltNavn",
      vedtakstypebegrunnelseFeltNavn: "vedtakstypebegrunnelseFeltNavn",
      vedtakstypeLabel: "vedtakstypeLabel",
      vedtakstypebegrunnelseLabel: "vedtakstypebegrunnelseLabel",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVedtakstype {...props} />);
    expect(container).toMatchSnapshot();
  });
});
