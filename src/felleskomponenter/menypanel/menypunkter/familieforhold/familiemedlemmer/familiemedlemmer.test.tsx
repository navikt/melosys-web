import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { MockedProvider } from "@apollo/client/testing";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";

import * as Nav from "../../../../../navFrontend";

import { Familiemedlemmer } from "./familiemedlemmer";
import { HentFamiliemedlemmerDocument } from "./hentFamiliemedlemmer.generated";
import { Familiemedlem as FamiliemedlemType, Familierelasjonsrolle } from "../../../../../graphql";
import BarnTable from "./tables/barnTable";
import EktefelleTable from "./tables/ektefelleTable";

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
        sivilstand: null,
      },
      {
        navn: "ektefelle",
        ident: "ektefelleident",
        relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
        alder: 30,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: {
          type: "Gift",
          erHistorisk: false,
          gyldigFraOgMed: "",
          master: "",
        },
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
        setTimeout(resolve, 30);
      });
      familiemedlemmer.update();

      const barnTable = familiemedlemmer.find(BarnTable);
      const ektefelleTable = familiemedlemmer.find(EktefelleTable);
      expect(barnTable.first().props().barnListe).toEqual([familiemedlems[0]]);
      expect(ektefelleTable.last().props().ektefelleListe).toEqual([familiemedlems[1]]);
    });
  });

  it("viser bare et barn og et ektefelle som er gift i dag med erHistorikk false", () => {
    const ektefeller: FamiliemedlemType[] = [
      {
        navn: "barn",
        ident: "barneident",
        relasjonsrolle: Familierelasjonsrolle.Barn,
        alder: 12,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: null,
      },
      {
        navn: "tidligere-ektefelle",
        ident: "tidligere-ektefelleident",
        relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
        alder: 32,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: {
          type: "Separert",
          erHistorisk: true,
          gyldigFraOgMed: "",
          master: "",
        },
      },
      {
        navn: "nåværende-ektefelle",
        ident: "ektefelleident",
        relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
        alder: 30,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: {
          type: "Gift",
          erHistorisk: false,
          gyldigFraOgMed: "",
          master: "",
        },
      },
      {
        navn: "gammel-ektefelle",
        ident: "gammel-ektefelleident",
        relasjonsrolle: Familierelasjonsrolle.RelatertVedSivilstand,
        alder: 44,
        foreldreansvar: "",
        fnrAnnenForelder: "",
        sivilstand: {
          type: "Ugift",
          erHistorisk: true,
          gyldigFraOgMed: "",
          master: "",
        },
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
                      familiemedlemmer: ektefeller,
                    },
                  },
                },
              },
            },
          ],
        },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 30);
      });
      familiemedlemmer.update();

      const barnTable = familiemedlemmer.find(BarnTable);
      const ektefelleTable = familiemedlemmer.find(EktefelleTable);

      const barnet = [ektefeller[0]];
      expect(barnTable.props().barnListe).toEqual(barnet);

      const nåværendeEktefelle = [ektefeller[2]];
      expect(ektefelleTable.props().ektefelleListe).toEqual(nåværendeEktefelle);
    });
  });
});
