import { ApolloClient } from "@apollo/client";
import { ApolloProvider, useQuery } from "@apollo/client/react";
import { MockLink } from "@apollo/client/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import apolloClient from "./apolloClient";
import { HentPersonopplysningerDocument } from "../felleskomponenter/informasjonlinje/hentpersonopplysninger.generated";
import { HentPersoninfoDocument } from "../felleskomponenter/menypanel/menypunkter/person/personinfo/hentPersoninfo.generated";
import { HentStatsborgerskapDocument } from "../felleskomponenter/menypanel/menypunkter/person/statsborgerskapTable/hentStatsborgerskap.generated";
import { HentAdresserDocument } from "../felleskomponenter/menypanel/menypunkter/person/adresser/hentAdresser/hentAdresser.generated";
import { HentFamiliemedlemmerDocument } from "../felleskomponenter/menypanel/menypunkter/familieforhold/familiemedlemmer/hentFamiliemedlemmer.generated";

const documents = [
  HentPersonopplysningerDocument,
  HentPersoninfoDocument,
  HentStatsborgerskapDocument,
  HentAdresserDocument,
  HentFamiliemedlemmerDocument,
];

const persondata = {
  __typename: "Personopplysninger",
  navn: { __typename: "Navn", fornavn: "Test", mellomnavn: null, etternavn: "Person" },
  kjoenn: "MANN",
  folkeregisteridentifikator: "123",
  folkeregisterpersonstatuser: [
    {
      __typename: "Folkeregisterpersonstatus",
      kode: "BOSATT",
      tekst: "Bosatt",
      master: "PDL",
      kilde: "FREG",
      fregGyldighetstidspunkt: "2021-01-01",
      erHistorisk: false,
    },
  ],
  foedsel: {
    __typename: "Foedsel",
    foedeland: "NO",
    foedested: "Oslo",
    foedselsaar: 1995,
    foedselsdato: "1995-09-23",
  },
  sivilstand: [
    {
      __typename: "Sivilstand",
      type: "UGIFT",
      relatertVedSivilstand: null,
      bekreftelsesdato: null,
      gyldigFraOgMed: "2021-01-01",
      master: "PDL",
      kilde: "FREG",
      erHistorisk: false,
    },
  ],
  statsborgerskap: [
    {
      __typename: "Statsborgerskap",
      land: "NO",
      bekreftelsesdato: null,
      gyldigFraOgMed: "2021-01-01",
      gyldigTilOgMed: null,
      master: "PDL",
      kilde: "FREG",
      erHistorisk: false,
    },
  ],
  bostedsadresser: [],
  oppholdsadresser: [],
  kontaktadresser: [],
  familiemedlemmer: [],
};

const response = (person = persondata) => ({
  data: { hentSaksopplysninger: { __typename: "Saksopplysninger", persondata: person } },
});

describe("Apollo-cache for personopplysninger", () => {
  const cache = apolloClient.cache;

  beforeEach(() => {
    cache.restore({});
  });

  it.each([
    { name: "informasjonslinjen først", queries: documents },
    { name: "informasjonslinjen sist", queries: [...documents].reverse() },
  ])("beholder alle delspørringer med $name", ({ queries }) => {
    for (const query of queries) {
      cache.writeQuery({ query, variables: { behandlingID: 1 }, data: response().data });
    }

    for (const query of documents) {
      expect(cache.readQuery({ query, variables: { behandlingID: 1 } })).not.toBeNull();
    }
  });

  it("erstatter oppdaterte lister uten å beholde gamle oppføringer", () => {
    const query = HentPersonopplysningerDocument;
    const variables = { behandlingID: 1 };
    cache.writeQuery({ query, variables, data: response().data });
    const updated = response({ ...persondata, sivilstand: [], folkeregisterpersonstatuser: [], statsborgerskap: [] });
    cache.writeQuery({ query, variables, data: updated.data });

    expect(cache.readQuery({ query, variables })).toEqual({
      hentSaksopplysninger: {
        __typename: "Saksopplysninger",
        persondata: {
          __typename: "Personopplysninger",
          navn: persondata.navn,
          kjoenn: persondata.kjoenn,
          folkeregisteridentifikator: persondata.folkeregisteridentifikator,
          sivilstand: [],
          folkeregisterpersonstatuser: [],
          statsborgerskap: [],
        },
      },
    });
  });

  it("holder persondata fra forskjellige behandlinger adskilt", () => {
    const query = HentPersoninfoDocument;
    const first = { query, variables: { behandlingID: 1 } };
    cache.writeQuery({ ...first, data: response().data });
    const original = cache.readQuery(first);
    const second = { query, variables: { behandlingID: 2 } };
    cache.writeQuery({
      ...second,
      data: response({ ...persondata, foedsel: { ...persondata.foedsel, foedested: "Bergen" } }).data,
    });

    expect(cache.readQuery(first)).toEqual(original);
    expect(cache.readQuery(second)).not.toEqual(original);
  });

  it("henter hver delspørring bare én gang uten å gå tilbake til lasting", async () => {
    const results = documents.map(() => vi.fn(() => response()));
    const client = new ApolloClient({
      cache,
      link: new MockLink(
        documents.map((query, index) => ({
          request: { query, variables: { behandlingID: 1 } },
          result: results[index],
          maxUsageCount: 10,
          delay: index * 10,
        })),
      ),
    });
    const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
    const { result, unmount } = renderHook(
      () => [
        useQuery(HentPersonopplysningerDocument, { variables: { behandlingID: 1 } }),
        useQuery(HentPersoninfoDocument, { variables: { behandlingID: 1 } }),
        useQuery(HentStatsborgerskapDocument, { variables: { behandlingID: 1 } }),
        useQuery(HentAdresserDocument, { variables: { behandlingID: 1 } }),
        useQuery(HentFamiliemedlemmerDocument, { variables: { behandlingID: 1 } }),
      ],
      { wrapper },
    );

    try {
      await waitFor(() => {
        expect(result.current.every((query) => !query.loading && query.data && !query.error)).toBe(true);
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
      for (const request of results) {
        expect(request).toHaveBeenCalledTimes(1);
      }
      expect(result.current.every((query) => !query.loading && query.data && !query.error)).toBe(true);
    } finally {
      unmount();
      client.stop();
    }
  });
});
