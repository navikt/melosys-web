import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { FamiliemedlemmerFraPDL } from "./familiemedlemmerFraPDL";
import FamiliemedlemGruppe from "./familiemedlemGruppe";
import { HentFamiliemedlemmerDocument } from "./hentFamiliemedlemmer.generated";
import { Familiemedlem as FamiliemedlemType, Familierelasjonsrolle } from "../../../../../graphql";

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

  it("viser melding ved error", () => {
    return act(async () => {
      const familiemedlemmerFraPDL = mount(<FamiliemedlemmerFraPDL {...props} />, {
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

      await new Promise((resolve) => setTimeout(resolve, 0));
      familiemedlemmerFraPDL.update();

      const alertstripe = familiemedlemmerFraPDL.find(Nav.AlertStripeFeil);
      expect(alertstripe.contains("Kunne ikke hente familiemedlemmer!")).toBe(true);
    });
  });

  it("viser FamiliemedlemGrupper for barn og ektefelle/partner", () => {
    return act(async () => {
      const familiemedlemmer: FamiliemedlemType[] = [
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
      const familiemedlemmerFraPDL = mount(<FamiliemedlemmerFraPDL {...props} />, {
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
                      familiemedlemmer,
                    },
                  },
                },
              },
            },
          ],
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      familiemedlemmerFraPDL.update();

      const familiemedlemGrupper = familiemedlemmerFraPDL.find(FamiliemedlemGruppe);
      expect(familiemedlemGrupper).toHaveLength(2);
      expect(familiemedlemGrupper.first().props().familiemedlemmer).toEqual([familiemedlemmer[0]]);
      expect(familiemedlemGrupper.last().props().familiemedlemmer).toEqual([familiemedlemmer[1]]);
    });
  });
});
