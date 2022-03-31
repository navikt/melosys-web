import React, { ComponentProps, MouseEvent } from "react";
import { mount } from "enzyme";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { Person } from "../../../../../services/api";
import Personinfo from "./personinfo";
import SivilstandModal from "./sivilstand/sivilstandModal";
import { HentPersoninfoDocument } from "./hentPersoninfo.generated";

describe("Personinfo", () => {
  const mockedProps = mock<ComponentProps<typeof Personinfo>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.behandlingID = 1;
    props.person = instance(mock<Person>());
    props.person.fnr = "12345678910";
    props.person.foedselsdato = "2004-01-01";
    /*
    Fikser error i console når test kjører:
    Warning: react-modal: App element is not defined. Please use `Modal.setAppElement(el)` or set `appElement={el}`. This is needed so screen readers don't see main content when modal is opened. It is not recommended, but you can opt-out by setting `ariaHideApp={false}`.
    */
    props.sivilstandModalAriaHideApp = false;
  });

  afterAll(() => {
    jest.resetModules();
  });

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
                folkeregisterpersonstatuser: null,
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

      const visMerSivilstandKnapp = personinfo.find(".personinfo__vis-detaljer-button").hostNodes();
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
});
