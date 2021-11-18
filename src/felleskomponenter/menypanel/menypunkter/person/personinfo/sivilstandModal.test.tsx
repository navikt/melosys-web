import React, { ComponentProps } from "react";
import { mount } from "enzyme";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { Sivilstand } from "../../../../../graphql";
import SivilstandModal from "./sivilstandModal";
import { HentSivilstandDocument } from "./hentSivilstand.generated";

describe("SivilstandModal", () => {
  const mockedProps = mock<ComponentProps<typeof SivilstandModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.onRequestClose = jest.fn();
    props.ariaHideApp = false;
    props.behandlingID = 1;
  });

  it("viser en Modal", () => {
    const sivilstandModal = mount(<SivilstandModal {...props} />, {
      wrappingComponent: MockedProvider,
    });

    const modal = sivilstandModal.find(Nav.Modal);
    expect(modal).toHaveLength(1);
    expect(modal.props().onRequestClose).toBe(props.onRequestClose);
  });

  it("viser melding ved henting av sivilstand", () => {
    const sivilstandModal = mount(<SivilstandModal {...props} />, {
      wrappingComponent: MockedProvider,
    });

    expect(sivilstandModal.contains("Henter sivilstand...")).toBe(true);
    expect(sivilstandModal.find(Nav.NavFrontendSpinner)).toHaveLength(1);
  });

  it("viser melding ved nettverkserror under henting av sivilstand", () => {
    return act(async () => {
      const sivilstandModal = mount(<SivilstandModal {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
            {
              request: {
                query: HentSivilstandDocument,
                variables: {
                  behandlingID: 1,
                },
              },
              error: new Error("feil"),
            },
          ],
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      sivilstandModal.update();

      const alertstripe = sivilstandModal.find(Nav.AlertStripeFeil);
      expect(alertstripe.contains("Feil ved henting av sivilstand!")).toBe(true);
    });
  });

  it("viser sivilstand-data etter den er hentet", () => {
    return act(async () => {
      const sivilstand: Sivilstand[] = [
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
      const sivilstandModal = mount(<SivilstandModal {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
            {
              request: {
                query: HentSivilstandDocument,
                variables: {
                  behandlingID: 1,
                },
              },
              result: {
                data: {
                  hentSaksopplysninger: {
                    persondata: {
                      sivilstand,
                    },
                  },
                },
              },
            },
          ],
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      sivilstandModal.update();

      const rows = sivilstandModal.find(".sivilstand-tabell__row").hostNodes();
      expect(rows).toHaveLength(2);

      const aktiveSivilstanderRow = rows.first();
      expect(aktiveSivilstanderRow.text()).toContain("Gift");
      expect(aktiveSivilstanderRow.text()).toContain("123");
      expect(aktiveSivilstanderRow.text()).toContain("09.10.2009");
      expect(aktiveSivilstanderRow.text()).toContain("10.10.2009");
      expect(aktiveSivilstanderRow.text()).toContain("PDL");
      expect(aktiveSivilstanderRow.text()).toContain("FREG");

      const historiskeSivilstanderRow = rows.last();
      expect(historiskeSivilstanderRow.text()).toContain("Ugift");
      expect(historiskeSivilstanderRow.text()).toContain("321");
      expect(historiskeSivilstanderRow.text()).toContain("01.01.2008");
      expect(historiskeSivilstanderRow.text()).toContain("02.01.2008");
      expect(historiskeSivilstanderRow.text()).toContain("PDL");
      expect(historiskeSivilstanderRow.text()).toContain("FREG");
    });
  });
});
