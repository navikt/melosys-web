import React, { ComponentProps, MouseEvent } from "react";
import { mount } from "enzyme";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { HentPersoninfoDocument } from "./hentPersoninfo.generated";
import Personinfo from "./personinfo";
import SivilstandModal from "./sivilstand/sivilstandModal";
import PersonstatusModal from "./personstatus/personstatusModal";

describe("Personinfo", () => {
  const mockedProps = mock<ComponentProps<typeof Personinfo>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.behandlingID = 1;
    props.fnr = "12345678910";
    /*
    Fikser error i console når test kjører:
    Warning: react-modal: App element is not defined. Please use `Modal.setAppElement(el)` or set `appElement={el}`. This is needed so screen readers don't see main content when modal is opened. It is not recommended, but you can opt-out by setting `ariaHideApp={false}`.
    */
    props.modalAriaHideApp = false;
  });

  afterAll(() => {
    jest.resetModules();
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
                foedsel: [{ foedselsaar: 1995, foedselsdato: "1995-23-09" }],
                sivilstand,
              },
            },
          },
        },
      },
    ],
  };

  it("viser melding ved henting av personinfo", () => {
    const personinfo = mount(<Personinfo {...props} />, {
      wrappingComponent: MockedProvider,
    });

    expect(personinfo.contains("Henter personinfo...")).toBe(true);
  });

  it("viser melding ved nettverkserror under henting av personinfo", () => {
    return act(async () => {
      const personinfo = await mount(<Personinfo {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
            {
              request: {
                query: HentPersoninfoDocument,
                variables: {
                  behandlingID: 1,
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
      personinfo.update();

      const alertstripe = personinfo.findWhere(
        (n) => n.type() === Nav.AlertStripeFeil && n.contains("Feil ved henting av personinfo!")
      );
      expect(alertstripe).toHaveLength(1);
    });
  });

  it("viser dagens sivilstand etter sivilstand er hentet", () => {
    return act(async () => {
      const personinfo = mount(<Personinfo {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: requestResultMock,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      personinfo.update();

      expect(personinfo.text()).toContain("Gift");
    });
  });

  it("sender sivilstand-data til sivilstandModal etter dataen er hentet", () => {
    return act(async () => {
      const personinfo = mount(<Personinfo {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: requestResultMock,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      personinfo.update();

      const visMerSivilstandKnapp = personinfo.find(".sivilstand__vis-detaljer-button").hostNodes();
      expect(visMerSivilstandKnapp).toHaveLength(1);
      const mouseEvent = instance(mock<MouseEvent<HTMLButtonElement>>());
      visMerSivilstandKnapp.props().onClick?.(mouseEvent);

      personinfo.update();
      const sivilstandModal = personinfo.find(SivilstandModal);
      expect(sivilstandModal).toHaveLength(1);
      expect(sivilstandModal.props().aktiveSivilstander).toEqual([sivilstand[0]]);
      expect(sivilstandModal.props().historiskeSivilstander).toEqual([sivilstand[1]]);
    });
  });

  it("sender personstatus-data til personstatusModal etter dataen er hentet", () => {
    return act(async () => {
      const personinfo = mount(<Personinfo {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: requestResultMock,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      personinfo.update();

      const visMerPersonstatusKnapp = personinfo.find(".personstatus__vis-detaljer-button").hostNodes();
      expect(visMerPersonstatusKnapp).toHaveLength(1);
      const mouseEvent = instance(mock<MouseEvent<HTMLButtonElement>>());
      visMerPersonstatusKnapp.props().onClick?.(mouseEvent);

      personinfo.update();
      const personstatusModal = personinfo.find(PersonstatusModal);
      expect(personstatusModal).toHaveLength(1);
      expect(personstatusModal.props().aktivePersonstatuser).toEqual([personstatus[0]]);
      expect(personstatusModal.props().historiskePersonstatuser).toEqual([personstatus[1], personstatus[2]]);
    });
  });
});
