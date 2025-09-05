import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import Vedtakstype from "./index";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("Vedtakstype", () => {
  let props = null;
  const WrappedVedtakstype = reduxForm({ form: "test" })(Vedtakstype);

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
