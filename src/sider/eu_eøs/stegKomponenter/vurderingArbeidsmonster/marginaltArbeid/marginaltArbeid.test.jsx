import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import { testReduxState } from "../../../../journalforing/komponenter/journalforingform/testReduxState";
import MarginaltArbeid from "./marginaltArbeid";
import { lagAvklartfakta } from "../../../../../felleskomponenter/stegvelger";
import MKV from "../../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../../constants";

const opprettLand = (k, t) => {
  return {
    land: {
      kode: k,
      term: t,
    },
    erLonnetArbeid: false,
    erSelvstendigNaeringsvirksomhet: false,
  };
};

describe("MarginaltArbeid", () => {
  const user = userEvent.setup();
  const oppdaterDataMock = vi.fn();

  let props = null;

  beforeAll(() => {
    props = {
      arbeidsland: [opprettLand("SVE", "SVERIGE"), opprettLand("NOR", "NORGE")],
      oppdaterData: oppdaterDataMock,
      redigerbart: true,
    };
  });

  it("viser ikkeredigerbar landliste", async () => {
    const { getByLabelText, getByText, getAllByRole } = renderWithProviders(
      <MarginaltArbeid {...props} redigerbart={false} />,
      {
        preloadedState: testReduxState,
      }
    );

    expect(getByText("SVERIGE")).toBeInTheDocument();
    expect(getByText("NORGE")).toBeInTheDocument();

    const checkboxes = getAllByRole("checkbox");

    expect(checkboxes[0]).not.toBeChecked();
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  it("oppdaterData mottar checkboxvalg", async () => {
    const { getAllByRole } = renderWithProviders(<MarginaltArbeid {...props} />, {
      preloadedState: testReduxState,
    });

    const checkboxes = getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
    expect(oppdaterDataMock).toBeCalled();
    expect(oppdaterDataMock).toBeCalledWith(
      lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, "SVE", BOOLSK_STRING.SANN)
    );
  });
});
