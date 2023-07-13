import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";
import { render, screen } from "@testing-library/react";

import MKV from "../../../../../../melosyskodeverk";
import AnnenForelderModal from "./annenForelderModal";
import { Bostedsadresse } from "../../../../../../graphql";
import { HentBostedsadresseForPersonDocument } from "../../../../../../graphql/adresse";

const { NO } = MKV.Koder.landkoder;

describe("annenForelderModal", () => {
  const mockedProps = mock<ComponentProps<typeof AnnenForelderModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.onRequestClose = vi.fn();
    props.contentLabel = "contentLabel";
    props.barnNavn = "barnNavn";
    props.forelderIdent = "123";
    props.ariaHideApp = false;
  });

  it("viser en Modal", () => {
    render(
      <MockedProvider>
        <AnnenForelderModal {...props} />
      </MockedProvider>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("viser melding ved henting av bostedsadresse", () => {
    render(
      <MockedProvider>
        <AnnenForelderModal {...props} />
      </MockedProvider>
    );

    expect(screen.getByRole("dialog")).toHaveTextContent("Henter bostedsadresse til annen forelder...");
  });

  it("viser melding ved nettverkserror under henting av bostedsadresse", () => {
    return act(async () => {
      render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: HentBostedsadresseForPersonDocument,
                variables: {
                  ident: "123",
                },
              },
              error: new Error("feil"),
            },
          ]}
        >
          <AnnenForelderModal {...props} />
        </MockedProvider>
      );

      expect(await screen.findByText("Feil ved henting av bostedsadresse!")).toBeInTheDocument();
    });
  });

  it("viser navn og adresse for annen forelder etter data er hentet", () => {
    return act(async () => {
      const bostedsadresser: Bostedsadresse[] = [
        {
          coAdressenavn: "coAdressenavn",
          adresse: {
            tilleggsnavn: "",
            gatenavn: "",
            husnummerEtasjeLeilighet: "",
            postboks: "",
            postnummer: "",
            poststed: "",
            region: "",
            land: NO,
          },
          gyldigFraOgMed: "2009-10-10",
          gyldigTilOgMed: "2010-10-10",
          master: "PDL",
          kilde: "FREG",
          erHistorisk: false,
        },
      ];

      render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: HentBostedsadresseForPersonDocument,
                variables: {
                  ident: "123",
                },
              },
              result: {
                data: {
                  hentPersonopplysninger: {
                    navn: {
                      fornavn: "LILLA",
                      mellomnavn: "MAGER",
                      etternavn: "HEST",
                    },
                    bostedsadresser,
                  },
                },
              },
            },
          ]}
        >
          <AnnenForelderModal {...props} />
        </MockedProvider>
      );

      expect(await screen.findByText("LILLA MAGER HEST")).toBeInTheDocument();
      expect(await screen.findByText("PDL")).toBeInTheDocument();
      expect(await screen.findByText("FREG")).toBeInTheDocument();
    });
  });

  it("viser navn, men ikke adresse, register eller kilde dersom ingen bostedsadresse funnet", () => {
    return act(async () => {
      render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: HentBostedsadresseForPersonDocument,
                variables: {
                  ident: "123",
                },
              },
              result: {
                data: {
                  hentPersonopplysninger: {
                    navn: {
                      fornavn: "LILLA",
                      mellomnavn: "MAGER",
                      etternavn: "HEST",
                    },
                    bostedsadresser: [],
                  },
                },
              },
            },
          ]}
        >
          <AnnenForelderModal {...props} />
        </MockedProvider>
      );

      expect(await screen.findByText("LILLA MAGER HEST")).toBeInTheDocument();
      expect(await screen.findAllByText("Ukjent")).toHaveLength(3);
    });
  });
});
