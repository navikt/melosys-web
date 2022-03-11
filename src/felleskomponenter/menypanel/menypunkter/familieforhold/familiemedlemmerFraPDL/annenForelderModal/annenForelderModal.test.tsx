import React, { ComponentProps } from "react";
import { mount } from "enzyme";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../../navFrontend";

import MKV from "../../../../../../melosyskodeverk";
import AnnenForelderModal from "./annenForelderModal";
import { HentBostedsadresseForPersonDocument } from "./hentBostedsadresseForPerson.generated";
import { Bostedsadresse } from "../../../../../../graphql";
import { StrukturertAdresse } from "../../../../../adresser";

const { NO } = MKV.Koder.landkoder;

describe("annenForelderModal", () => {
  const mockedProps = mock<ComponentProps<typeof AnnenForelderModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.onRequestClose = jest.fn();
    props.contentLabel = "contentLabel";
    props.barnNavn = "barnNavn";
    props.forelderIdent = "123";
    props.ariaHideApp = false;
  });

  it("viser en Modal", () => {
    const annenForelderModal = mount(<AnnenForelderModal {...props} />, {
      wrappingComponent: MockedProvider,
    });

    const modal = annenForelderModal.find(Nav.Modal);
    expect(modal).toHaveLength(1);
    expect(modal.props().onRequestClose).toBe(props.onRequestClose);
    expect(modal.props().contentLabel).toBe(props.contentLabel);
    expect(modal.contains(props.barnNavn)).toBe(true);
  });

  it("viser melding ved henting av bostedsadresse", () => {
    const annenForelderModal = mount(<AnnenForelderModal {...props} />, {
      wrappingComponent: MockedProvider,
    });

    expect(annenForelderModal.contains("Henter bostedsadresse til annen forelder...")).toBe(true);
    expect(annenForelderModal.find(Nav.NavFrontendSpinner)).toHaveLength(1);
  });

  it("viser melding ved nettverkserror under henting av bostedsadresse", () => {
    return act(async () => {
      const annenForelderModal = await mount(<AnnenForelderModal {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
            {
              request: {
                query: HentBostedsadresseForPersonDocument,
                variables: {
                  ident: "123",
                },
              },
              error: new Error("feil"),
            },
          ],
        },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      annenForelderModal.update();

      const alertstripe = annenForelderModal.find(Nav.AlertStripeFeil);
      expect(alertstripe.contains("Feil ved henting av bostedsadresse!")).toBe(true);
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
      const annenForelderModal = await mount(<AnnenForelderModal {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
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
          ],
        },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      annenForelderModal.update();

      expect(annenForelderModal.contains("LILLA MAGER HEST")).toBe(true);
      expect(annenForelderModal.contains("PDL")).toBe(true);
      expect(annenForelderModal.contains("FREG")).toBe(true);
      const strukturertAdresse = annenForelderModal.find(StrukturertAdresse);
      expect(strukturertAdresse.props().adresse).toEqual(bostedsadresser[0].adresse);
    });
  });

  it("viser navn, men ikke adresse, register eller kilde dersom ingen bostedsadresse funnet", () => {
    return act(async () => {
      const annenForelderModal = await mount(<AnnenForelderModal {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
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
          ],
        },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      annenForelderModal.update();

      const tabellRow = annenForelderModal.find(".annen-forelder-modal__tabell__row").hostNodes();
      expect(tabellRow).toHaveLength(1);
      const tabellColumns = tabellRow.find(Nav.Column);
      expect(tabellColumns.first().text()).toContain("LILLA MAGER HEST");
      expect(tabellColumns.at(1).text()).toContain("Ukjent");
      expect(tabellColumns.at(2).text()).toContain("Ukjent");
      expect(tabellColumns.at(3).text()).toContain("Ukjent");
    });
  });
});
