import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";

import { EnkeltArbeidsforholdUtland } from "./enkeltArbeidsforholdUtland";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("EnkeltArbeidsforholdUtland", () => {
  let props: any;
  const WrappedEnkeltArbeidsforholdUtland = reduxForm({ form: "test" })(EnkeltArbeidsforholdUtland as any);

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

  it("har ikke postboks-input i redigeringsmodus", () => {
    renderWithProviders(<WrappedEnkeltArbeidsforholdUtland {...props} />);
    expect(screen.queryByLabelText("Postboks")).not.toBeInTheDocument();
  });

  it("region er redigerbar når redigerbart er true", () => {
    renderWithProviders(<WrappedEnkeltArbeidsforholdUtland {...props} />);
    expect(screen.getByLabelText("Region")).not.toBeDisabled();
  });

  it("region er låst når redigerbart er false", () => {
    renderWithProviders(<WrappedEnkeltArbeidsforholdUtland {...props} redigerbart={false} />);
    expect(screen.getByLabelText("Region")).toBeDisabled();
  });
});
