import { MockedProvider } from "@apollo/client/testing";
import Familiemedlemmer from "./familiemedlemmer";
import { HentFamiliemedlemmerDocument } from "./hentFamiliemedlemmer.generated";
import { Familierelasjonsrolle } from "../../../../../graphql";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import { STATUS } from "../../../../../services";

const barn = {
  navn: "barn",
  ident: "barneident",
  relasjonsrolle: Familierelasjonsrolle.Barn,
  alder: 12,
  foreldreansvar: "",
  fnrAnnenForelder: "",
  sivilstand: null,
};
const ektefelle = {
  navn: "ektefelle",
  ident: "ektefelleident",
  relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
  alder: 30,
  foreldreansvar: "",
  fnrAnnenForelder: "",
  sivilstand: {
    type: "Gift",
    erHistorisk: false,
    gyldigFraOgMed: "",
    master: "",
  },
};
const tidligereEktefelle = {
  navn: "tidligere-ektefelle",
  ident: "tidligere-ektefelleident",
  relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
  alder: 32,
  foreldreansvar: "",
  fnrAnnenForelder: "",
  sivilstand: {
    type: "Separert",
    erHistorisk: true,
    gyldigFraOgMed: "",
    master: "",
  },
};
const gammelEktefelle = {
  navn: "gammel-ektefelle",
  ident: "gammel-ektefelleident",
  relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
  alder: 44,
  foreldreansvar: "",
  fnrAnnenForelder: "",
  sivilstand: {
    type: "Ugift",
    erHistorisk: true,
    gyldigFraOgMed: "",
    master: "",
  },
};

describe("Familiemedlemmer", () => {
  const initialReduxState = {
    behandlinger: {
      data: {
        behandlingID: 1,
      },
      status: STATUS.OK,
    },
  };

  it("viser melding ved loading", () => {
    const { getByText } = renderWithProviders(
      <MockedProvider
        mocks={[
          {
            request: {
              query: HentFamiliemedlemmerDocument,
              variables: {
                behandlingID: 1,
              },
            },
          },
        ]}
      >
        <Familiemedlemmer />
      </MockedProvider>,
      { preloadedState: initialReduxState },
    );

    expect(getByText("Henter familiemedlemmer...")).toBeInTheDocument();
  });

  it("viser melding ved nettverkserror", async () => {
    const { findByText } = renderWithProviders(
      <MockedProvider
        mocks={[
          {
            request: {
              query: HentFamiliemedlemmerDocument,
              variables: {
                behandlingID: 1,
              },
            },
            error: new Error("feil"),
          },
        ]}
      >
        <Familiemedlemmer />
      </MockedProvider>,
      { preloadedState: initialReduxState },
    );

    expect(await findByText("Kunne ikke hente familiemedlemmer!")).toBeInTheDocument();
  });

  it("viser FamiliemedlemGrupper for barn og ektefelle/partner", async () => {
    const { findAllByRole, getByText } = renderWithProviders(
      <MockedProvider
        mocks={[
          {
            request: {
              query: HentFamiliemedlemmerDocument,
              variables: {
                behandlingID: 1,
              },
            },
            result: {
              data: {
                hentSaksopplysninger: {
                  persondata: {
                    familiemedlemmer: [barn, ektefelle],
                  },
                },
              },
            },
          },
        ]}
      >
        <Familiemedlemmer />
      </MockedProvider>,
      { preloadedState: initialReduxState },
    );

    expect(await findAllByRole("table")).toHaveLength(2);
    expect(getByText(barn.ident)).toBeInTheDocument();
    expect(getByText(ektefelle.ident)).toBeInTheDocument();
  });

  it("viser bare et barn og et ektefelle som er gift i dag med erHistorikk false", async () => {
    const { findAllByRole, getByText, queryByText } = renderWithProviders(
      <MockedProvider
        mocks={[
          {
            request: {
              query: HentFamiliemedlemmerDocument,
              variables: {
                behandlingID: 1,
              },
            },
            result: {
              data: {
                hentSaksopplysninger: {
                  persondata: {
                    familiemedlemmer: [barn, ektefelle, tidligereEktefelle, gammelEktefelle],
                  },
                },
              },
            },
          },
        ]}
      >
        <Familiemedlemmer />
      </MockedProvider>,
      { preloadedState: initialReduxState },
    );

    expect(await findAllByRole("table")).toHaveLength(2);
    expect(getByText(barn.ident)).toBeInTheDocument();
    expect(getByText(ektefelle.ident)).toBeInTheDocument();
    expect(queryByText(tidligereEktefelle.ident)).not.toBeInTheDocument();
    expect(queryByText(gammelEktefelle.ident)).not.toBeInTheDocument();
  });
});
