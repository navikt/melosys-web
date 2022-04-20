import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { Familiemedlemmer } from "./familiemedlemmer";
import FamiliemedlemGruppe from "./familiemedlemGruppe";
import { HentFamiliemedlemmerDocument } from "./hentFamiliemedlemmer.generated";
import { Familiemedlem as FamiliemedlemType, Familierelasjonsrolle } from "../../../../../graphql";

describe("Familiemedlemmer", () => {
  const mockedProps = mock<ComponentProps<typeof Familiemedlemmer>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.behandlingID = 1;
  });

  it("viser melding ved loading", () => {
    const familiemedlemmer = mount(<Familiemedlemmer {...props} />, {
      wrappingComponent: MockedProvider,
    });

    expect(familiemedlemmer.contains("Henter familiemedlemmer...")).toBe(true);
  });

  it("viser melding ved nettverkserror", () => {
    return act(async () => {
      const familiemedlemmer = await mount(<Familiemedlemmer {...props} />, {
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
        setTimeout(resolve, 20);
      });
      familiemedlemmer.update();

      const alertstripe = familiemedlemmer.find(Nav.AlertStripeFeil);
      expect(alertstripe.contains("Kunne ikke hente familiemedlemmer!")).toBe(true);
    });
  });

  it("viser FamiliemedlemGrupper for barn og ektefelle/partner", () => {
    const familiemedlems: FamiliemedlemType[] = [
      {
        navn: "barn",
        ident: "barneident",
        relasjonsrolle: Familierelasjonsrolle.Barn,
        alder: 12,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: "",
        sivilstandGyldighetsperiodeFom: "",
      },
      {
        navn: "ektefelle",
        ident: "ektefelleident",
        relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
        alder: 30,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: "",
        sivilstandGyldighetsperiodeFom: "",
      },
    ];

    return act(async () => {
      const familiemedlemmer = await mount(<Familiemedlemmer {...props} />, {
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
              result: {
                data: {
                  hentSaksopplysninger: {
                    persondata: {
                      familiemedlemmer: familiemedlems,
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
      familiemedlemmer.update();

      const familiemedlemGrupper = familiemedlemmer.find(FamiliemedlemGruppe);
      expect(familiemedlemGrupper).toHaveLength(2);
      expect(familiemedlemGrupper.first().props().familiemedlemmer).toEqual([familiemedlems[0]]);
      expect(familiemedlemGrupper.last().props().familiemedlemmer).toEqual([familiemedlems[1]]);
    });
  });
});
