import { reduxForm } from "redux-form";

import Select, { SelectWrappedComponent } from "./select";
import { expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("Select", () => {
  it("snapshot test", () => {
    const WrappedSelect = reduxForm({ form: "test" })(Select as any);

    const props = {
      id: "1234",
      feltNavn: "feltnavn",
      className: "className",
    };
    // @ts-expect-error generisk beskrivelse
    const { container } = renderWithProviders(<WrappedSelect {...props} />);
    expect(container).toMatchSnapshot();
  });

  describe("SelectWrappedComponent", () => {
    const props = (meta: any = {}) => ({
      label: "Label",
      children: (
        <option key="1" value="1">
          Hallo hallo
        </option>
      ),
      input: {
        name: "feltName",
        value: "",
      },
      meta,
    });

    it("setter feil-prop dersom meta.error prop finnes", () => {
      const meta = {
        touched: true,
        active: false,
        error: "err",
      };

      // @ts-expect-error generisk beskrivelse
      renderWithProviders(<SelectWrappedComponent {...props(meta)} />);
      expect(screen.getByText("err")).toBeInTheDocument();
    });
  });
});
