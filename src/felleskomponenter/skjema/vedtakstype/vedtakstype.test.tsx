import { describe, it, expect, beforeEach } from "vitest";

import Vedtakstype from "./index";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("Vedtakstype", () => {
  let props: any;
  const WrappedVedtakstype = reduxForm({ form: "test" })(Vedtakstype as any);

  beforeEach(() => {
    props = {
      className: "artikkel",
      redigerbart: true,
      vedtakstypebegrunnelseFeltNavn: "vedtakstypebegrunnelseFeltNavn",
      vedtakstypebegrunnelseLabel: "vedtakstypebegrunnelseLabel",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVedtakstype {...props} />);
    expect(container).toMatchSnapshot();
  });
});
