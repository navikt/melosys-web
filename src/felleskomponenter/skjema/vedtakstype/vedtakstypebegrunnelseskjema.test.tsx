import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import React from "react";

import VedtakstypebegrunnelseSkjema from "./vedtakstypebegrunnelseskjema";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("VedtakstypebegrunnelseSkjema", () => {
  let props: any;
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
