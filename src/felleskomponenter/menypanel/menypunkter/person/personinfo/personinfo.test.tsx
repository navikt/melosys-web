import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HentPersoninfoDocument } from "./hentPersoninfo.generated";
import Personinfo from "./personinfo";
import { HentPersonopplysningerDocument } from "../../../../informasjonlinje/hentpersonopplysninger.generated";

describe("Personinfo", () => {
  window.matchMedia =
    window.matchMedia ||
    function x() {
      return {
        matches: false,
        addEventListener: function y() {},
        removeEventListener: function z() {},
      };
    };

  const mockedProps = mock<ComponentProps<typeof Personinfo>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.behandlingID = 1;
  });

  afterAll(() => {
    vi.resetModules();
  });

  const personstatus = [
    {
      kode: "BOSATT",
      tekst: "Bosatt etter folkeregisterloven",
      master: "PDL",
      kilde: "folkeregisteret",
      fregGyldighetstidspunkt: "2021-01-01",
      erHistorisk: false,
    },
    {
      kode: "IKKE_BOSATT",
      tekst: "Bosatt utenfor Norge",
      master: "PDL",
      kilde: "folkeregisteret",
      fregGyldighetstidspunkt: "2001-01-01",
      erHistorisk: true,
    },
    {
      kode: "BOSATT",
      tekst: "Bosatt etter folkeregisterloven",
      master: "PDL",
      kilde: "folkeregisteret",
      fregGyldighetstidspunkt: "2000-03-25",
      erHistorisk: true,
    },
  ];

  const sivilstand = [
    {
      type: "Gift",
      relatertVedSivilstand: "123",
      bekreftelsesdato: "2009-10-09",
      gyldigFraOgMed: "2009-10-10",
      master: "PDL",
      kilde: "FREG",
      erHistorisk: false,
    },
    {
      type: "Ugift",
      relatertVedSivilstand: "321",
      bekreftelsesdato: "2008-01-01",
      gyldigFraOgMed: "2008-01-02",
      master: "PDL",
      kilde: "FREG",
      erHistorisk: true,
    },
  ];

  const requestResultMock = {
    mocks: [
      {
        request: {
          query: HentPersoninfoDocument,
          variables: {
            behandlingID: 1,
          },
        },
        result: {
          data: {
            hentSaksopplysninger: {
              persondata: {
                folkeregisterpersonstatuser: personstatus,
                foedselsdato: [{ foedselsaar: 1995, foedselsdato: "1995-23-09" }],
                sivilstand,
              },
            },
          },
        },
      },
      {
        request: {
          query: HentPersonopplysningerDocument,
          variables: {
            behandlingID: 1,
          },
        },
        result: {
          data: {
            hentSaksopplysninger: {
              persondata: {
                navn: {
                  fornavn: "Kent",
                  mellomnavn: "C",
                  etternavn: "Dodds",
                },
                kjoenn: "",
                folkeregisterpersonstatuser: [],
                folkeregisteridentifikator: "123",
                statsborgerskap: [],
                sivilstand: [],
              },
            },
          },
        },
      },
    ],
  };

  it("viser melding ved henting av personinfo", () => {
    render(
      <MockedProvider {...requestResultMock}>
        <Personinfo {...props} />
      </MockedProvider>,
    );

    expect(screen.getByText("Henter personinfo...")).toBeInTheDocument();
  });

  it("viser melding ved nettverkserror under henting av personinfo", async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: HentPersoninfoDocument,
              variables: {
                behandlingID: 1,
              },
            },
            error: new Error("feil"),
          },
          {
            request: {
              query: HentPersonopplysningerDocument,
              variables: {
                behandlingID: 1,
              },
            },
            error: new Error("feil"),
          },
        ]}
      >
        <Personinfo {...props} />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Feil ved henting av personinfo!")).toBeInTheDocument();
    });
  });

  it("sender sivilstand-data til sivilstandModal etter dataen er hentet", async () => {
    render(
      <MockedProvider {...requestResultMock}>
        <Personinfo {...props} />
      </MockedProvider>,
    );

    const user = userEvent.setup();
    const detaljerKnapper = await screen.findAllByText("Vis detaljer");
    expect(detaljerKnapper).toHaveLength(2);

    await user.click(detaljerKnapper[1]);

    const dialog = await screen.findByLabelText("Sivilstand");

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Historikk")).toBeInTheDocument();
    expect(within(dialog).getByText("Gift")).toBeInTheDocument();
    expect(within(dialog).getByText("Ugift")).toBeInTheDocument();
  });

  it("sender personstatus-data til personstatusModal etter dataen er hentet", async () => {
    render(
      <MockedProvider {...requestResultMock}>
        <Personinfo {...props} />
      </MockedProvider>,
    );

    const user = userEvent.setup();
    const detaljerKnapper = await screen.findAllByText("Vis detaljer");
    expect(detaljerKnapper).toHaveLength(2);

    await user.click(detaljerKnapper[0]);

    const dialog = await screen.findByLabelText("Personstatus");
    expect(dialog).toBeInTheDocument();

    expect(within(dialog).getByText("Historikk")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Bosatt etter folkeregisterloven")).toHaveLength(2);
    expect(within(dialog).getByText("Bosatt utenfor Norge")).toBeInTheDocument();
  });
});
