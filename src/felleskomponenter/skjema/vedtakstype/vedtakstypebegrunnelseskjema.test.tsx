import { describe, it, expect, beforeEach } from "vitest";

import VedtakstypebegrunnelseSkjema from "./vedtakstypebegrunnelseskjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("VedtakstypebegrunnelseSkjema", () => {
  let props: any;
  const WrappedVedtakstypebegrunnelseSkjema = reduxForm({ form: "test" })(VedtakstypebegrunnelseSkjema as any);

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
