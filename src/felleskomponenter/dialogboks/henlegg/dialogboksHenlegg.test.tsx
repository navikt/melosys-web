import React, { ComponentProps } from "react";
import { mount } from "enzyme";
import { instance, mock } from "ts-mockito";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";
import PdfLenkeListe from "../../pdfLenkeListe";
import { DialogboksHenleggSak } from "./dialogboksHenlegg";
import { KodeTermSelect } from "../../ui/kodeTermSelect";
import { MockedProvider } from "@apollo/client/testing";
import { HentFamiliemedlemmerDocument } from "../../menypanel/menypunkter/familieforhold/familiemedlemmer/hentFamiliemedlemmer.generated";
import { HentKontaktadresseDocument } from "./hentKontaktadresse/hentKontaktadresse.generated";

describe("Dialogbokshenlegg", () => {
  const mockedProps = mock<ComponentProps<typeof DialogboksHenleggSak>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.behandlingID = 1;
    props.redigerbart = true;
    props.ariaHideApp = false;
    props.avbryt = jest.fn();
    props.henleggHandle = jest.fn();
    props.dispatch = jest.fn();
  });

  it("viser en Nav Modal", () => {
    const komponent = mount(<DialogboksHenleggSak {...props} />, {
      wrappingComponent: MockedProvider,
    });
    expect(komponent.exists(Nav.Modal)).toBe(true);
  });

  describe("Modal", () => {
    it("viser en dropdownliste", () => {
      const komponent = mount(<DialogboksHenleggSak {...props} />, {
        wrappingComponent: MockedProvider,
      });
      expect(komponent.exists(KodeTermSelect)).toBe(true);
    });

    it("viser en pdflenkeliste", async () => {
      const komponent = mount(<DialogboksHenleggSak {...props} />, {
        wrappingComponent: MockedProvider,
        wrappingComponentProps: {
          mocks: [
            {
              request: {
                query: HentKontaktadresseDocument,
                variables: {
                  behandlingID: 1,
                },
              },
              result: {
                data: {
                  hentSaksopplysninger: {
                    persondata: {
                      kontaktadresser: [
                        {
                          erHistorisk: false,
                        },
                      ],
                    },
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
      komponent.update();
      expect(komponent.exists(PdfLenkeListe)).toBe(true);
    });

    it("viser en Knapperad", () => {
      props.redigerbart = false;
      const komponent = mount(<DialogboksHenleggSak {...props} />, {
        wrappingComponent: MockedProvider,
      });

      expect(komponent.find(Knapperad).props().redigerbart).toBe(props.redigerbart);
      expect(komponent.find(Knapperad).props().avbryt).toBe(props.avbryt);
    });
  });
});
