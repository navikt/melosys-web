import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import { testReduxState } from "../../../../journalforing/komponenter/journalforingform/testReduxState";
import MarginaltArbeid from "./marginaltArbeid";
import { getAllByRole, prettyDOM } from "@testing-library/dom";
import { lagAvklartfakta } from "../../../../../felleskomponenter/stegvelger";
import MKV from "../../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../../constants";
import { string } from "yup";
//import { useSelector } from "react-redux";
/*
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: () => true,
  };
});

 */

describe("MarginaltArbeid", () => {
  const user = userEvent.setup();
  const oppdaterDataMock = vi.fn();

  let props = null;
  const sveOption = {
    land: {
      kode: "SVE",
      term: "SVERIGE",
    },
    erLonnetArbeid: false,
    erSelvstendigNaeringsvirksomhet: false,
  };
  const norOption = {
    land: {
      kode: "NOR",
      term: "NORGE",
    },
    erLonnetArbeid: false,
    erSelvstendigNaeringsvirksomhet: false,
  };

  beforeAll(() => {
    props = {
      arbeidsland: [opprettLand("SVE", "SVERIGE"), opprettLand("NOR", "NORGE")],
      oppdaterData: oppdaterDataMock,
      redigerbart: true,
    };
  });

  it("viser ikkeredigerbar landliste", async () => {
    const { getByText } = renderWithProviders(<MarginaltArbeid {...props} />, {
      preloadedState: testReduxState,
    });

    expect(getByText("SVERIGE")).toBeInTheDocument();
    expect(getByText("NORGE")).toBeInTheDocument();
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

  const opprettLand = (kode, term) => {
    return {
      land: {
        kode: kode,
        term: term,
      },
      erLonnetArbeid: false,
      erSelvstendigNaeringsvirksomhet: false,
    };
  };
});
