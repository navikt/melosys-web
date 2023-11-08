import Radio from "./radio";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { cleanup } from "@testing-library/react";

const WrappedRadio = reduxForm({ form: "test" })(Radio);

describe("Radio", () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: "Test",
      id: "1",
      input: {
        value: "",
        name: "Testname",
      },
      meta: {
        error: "",
        touched: false,
        active: true,
        dispatch: vi.fn(),
      },
      forhandsvalgt: false,
      label: "Test",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedRadio {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("setter checked riktig", () => {
    const data = [
      [true, false, true, true],
      [false, false, false, true],
      [true, true, false, true],
      [false, true, false, false],
      [true, false, false, false],
    ];
    data.forEach((testdata) => {
      /* eslint-disable prefer-destructuring */
      props.input.value = testdata[0];
      props.value = testdata[1];
      props.forhandsvalgt = testdata[2];
      /* eslint-enable prefer-destructuring */

      const { getByLabelText } = renderWithProviders(<WrappedRadio {...props} />);
      expect(getByLabelText(props.label).checked).toEqual(testdata[3]);

      cleanup();
    });
  });
});
