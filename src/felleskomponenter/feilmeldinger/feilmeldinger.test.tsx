import React from "react";
import Feilmeldinger from "./feilmeldinger";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { STATUS } from "../../services";
import MKV from "../../melosyskodeverk";

const getPreloadedState = (feilkoder: { kode: string; felter: string[] }[]) => {
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
  };
};

describe("Feilmeldinger", () => {
  it("Viser ingenting dersom det ikke finnes en mapping for feilkode", () => {
    const { queryByText } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState([{ kode: "tilfeldigString", felter: [] }]),
    });

    expect(queryByText("tilfeldigString")).not.toBeInTheDocument();
  });

  it("Viser feilmelding fra kodeverk dersom mapping for feilkode finnes", () => {
    const { getByText, queryByRole } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState([
        { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] },
      ]),
    });

    expect(getByText("Det finnes overlappende periode i MEDL")).toBeInTheDocument();
    expect(queryByRole("listitem")).not.toBeInTheDocument();
  });
  it("Viser punktliste med feilmeldinger dersom mer enn en feilkode sendes inn", () => {
    const { getAllByRole } = renderWithProviders(<Feilmeldinger />, {
      preloadedState: getPreloadedState([
        { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] },
        { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [] },
      ]),
    });

    expect(getAllByRole("listitem")).toHaveLength(2);
  });
});
