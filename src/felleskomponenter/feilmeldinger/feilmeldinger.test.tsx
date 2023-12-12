import Feilmeldinger from "./feilmeldinger";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { STATUS } from "../../services";
import MKV from "../../melosyskodeverk";

const getPreloadedState = (
  feilkoder: { kode: string; felter: string[] }[],
  kontrollFeil: { kode: string; felter: string[]; type: string }[]
) => {
  return {
    feiletRespons: {
      status: STATUS.ERROR,
      data: {
        data: {
          error: STATUS.ERROR,
          status: 400,
          message: "",
          feilkoder,
        },
      },
    },
    kontroll: { status: "OK", data: { kontrollfeilList: kontrollFeil } },
  };
};

describe("Feilmeldinger", () => {
  it("Viser ingenting dersom det ikke finnes en mapping for feilkode", () => {
    const { queryByText } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState([{ kode: "tilfeldigString", felter: [] }], []),
    });

    expect(queryByText("tilfeldigString")).not.toBeInTheDocument();
  });

  it("Viser feilmelding fra kodeverk dersom mapping for feilkode finnes", () => {
    const { getByText, queryByRole } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState(
        [],
        [{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [], type: "FEIL" }]
      ),
    });

    expect(getByText("Det finnes overlappende periode i MEDL")).toBeInTheDocument();
    expect(queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("Viser advarsel fra kodeverk dersom mapping for feilkode finnes", () => {
    const { getByText, queryByRole } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState(
        [],
        [
          {
            kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
            felter: [],
            type: "ADVARSEL",
          },
        ]
      ),
    });

    expect(getByText("Det finnes overlappende periode i MEDL")).toBeInTheDocument();
    expect(queryByRole("listitem")).not.toBeInTheDocument();
  });
  it("Viser punktliste med feilmeldinger dersom mer enn en feilkode sendes inn", () => {
    const { getAllByRole } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState(
        [],
        [
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [], type: "FEIL" },
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [], type: "FEIL" },
        ]
      ),
    });

    expect(getAllByRole("listitem")).toHaveLength(2);
  });

  it("Viser både feilmelding og advarsel seperat. Skal ikke være liste", () => {
    const { getByText, queryByRole } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState(
        [],
        [
          {
            kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
            felter: [],
            type: "ADVARSEL",
          },
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [], type: "FEIL" },
        ]
      ),
    });

    expect(getByText("Det finnes overlappende periode i MEDL")).toBeInTheDocument();
    expect(getByText("Bostedsadresse trengs for å kunne utstede A1.")).toBeInTheDocument();
    expect(queryByRole("listitem")).not.toBeInTheDocument();
  });
});
