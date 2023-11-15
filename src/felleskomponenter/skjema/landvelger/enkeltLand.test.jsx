import EnkeltLand from "./enkeltLand";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";

const WrappedEnkeltLand = reduxForm({ form: "test" })(EnkeltLand);

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("EnkeltLand", () => {
  let props = null;

  beforeEach(() => {
    props = {
      dataListID: "1",
      landkoder: [
        { kode: "NO", term: "Norge" },
        { kode: "SE", term: "Sverige" },
      ],
      meta: {},
      label: "label",
      feil: undefined,
      input: { onChange: () => null, onBlur: () => null },
      disabled: false,
      feltNavn: "Testnavn",
      name: "Testnavn",
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedEnkeltLand {...props} />);
    expect(container).toMatchSnapshot();
  });

  describe("ved fokus flyttet fra input", () => {
    it("hvis tekst ikke er skrevet inn, ikke vis feilmelding", () => {
      const { queryByText } = renderWithProviders(<WrappedEnkeltLand {...props} />);
      expect(queryByText("Finner ikke landet du har skrevet inn.")).not.toBeInTheDocument();
    });

    it("hvis tekst er skrevet inn men landkoder prop mangler, lag feilmelding", async () => {
      props.landkoder = [];
      const { getByRole, getByText } = renderWithProviders(<WrappedEnkeltLand {...props} />);
      const user = userEvent.setup();

      const input = getByRole("combobox");
      await user.clear(input);
      await userEvent.type(input, "Norge");
      await userEvent.tab();
      expect(getByText("Finner ikke landet du har skrevet inn.")).toBeInTheDocument();
    });

    it("hvis tekst er skrevet inn og landkoder prop er oppgitt, oppdater input-verdi", async () => {
      props.landkoder = [
        { kode: "NO", term: "Norge" },
        { kode: "SE", term: "Sverige" },
      ];
      const { getByRole, getByDisplayValue, queryByText } = renderWithProviders(<WrappedEnkeltLand {...props} />);
      const user = userEvent.setup();

      const input = getByRole("combobox");
      await user.clear(input);
      await userEvent.type(input, "Norge");
      await userEvent.tab();
      expect(getByDisplayValue("Norge (NO)")).toBeInTheDocument();
      expect(queryByText("Finner ikke landet du har skrevet inn.")).not.toBeInTheDocument();
    });
  });
});
