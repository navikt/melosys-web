import { describe, it, expect, beforeEach } from "vitest";

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
});
