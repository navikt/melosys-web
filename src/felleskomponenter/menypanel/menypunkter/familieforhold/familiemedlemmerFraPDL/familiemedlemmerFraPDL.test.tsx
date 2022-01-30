import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { FamiliemedlemmerFraPDL } from "./familiemedlemmerFraPDL";
import { HentFamiliemedlemmerDocument } from "./hentFamiliemedlemmer.generated";

describe("FamiliemedlemmerFraPDL", () => {
  const mockedProps = mock<ComponentProps<typeof FamiliemedlemmerFraPDL>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.behandlingID = 1;
  });

  it("viser melding ved loading", () => {
    const familiemedlemmerFraPDL = mount(<FamiliemedlemmerFraPDL {...props} />, {
      wrappingComponent: MockedProvider,
    });

    expect(familiemedlemmerFraPDL.contains("Henter familiemedlemmer...")).toBe(true);
  });

  it("viser melding ved nettverkserror", () =>
    act(async () => {
      const familiemedlemmerFraPDL = await mount(<FamiliemedlemmerFraPDL {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
            {
              request: {
                query: HentFamiliemedlemmerDocument,
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
      familiemedlemmerFraPDL.update();

      const alertstripe = familiemedlemmerFraPDL.find(Nav.AlertStripeFeil);
      expect(alertstripe.contains("Kunne ikke hente familiemedlemmer!")).toBe(true);
    }));
});
