import React, { ComponentProps } from "react";
import { mount } from "enzyme";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { Person } from "../../../../../services/api";
import { HentSivilstandDocument } from "./sivilstand/hentSivilstand.generated";
import Personinfo from "./personinfo";

jest.mock("../../../../../featuretoggle", () => ({
  __esModule: true,
  useFeatureToggle: () => "enabled",
}));

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

  it("viser melding ved henting av sivilstand", () => {
    const sivilstandModal = mount(<Personinfo {...props} />, {
      wrappingComponent: MockedProvider,
    });

    expect(sivilstandModal.contains("Henter sivilstand...")).toBe(true);
  });

  it("viser melding ved nettverkserror under henting av sivilstand", () =>
    act(async () => {
      const personinfo = await mount(<Personinfo {...props} />, {
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

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      personinfo.update();

      const alertstripe = personinfo.findWhere(
        (n) => n.type() === Nav.AlertStripeFeil && n.contains("Feil ved henting av sivilstand!")
      );
      expect(alertstripe).toHaveLength(1);
    }));
});
