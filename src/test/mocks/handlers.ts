import { http, HttpResponse } from "msw";

/**
 * MSW handlers for test-mocking av API-endepunkter
 *
 * Disse handlersene mocker de mest brukte endepunktene i test-suiten.
 * For å mocke spesifikke responser i individuelle tester, bruk server.use()
 */
export const handlers = [
  // 1. Trygdeavgift oppsummering - mest brukt (17 kall i knyttTilSak.test.tsx)
  http.get("/api/fagsaker/:saksnummer/trygdeavgift/oppsummering", () => {
    return HttpResponse.json({
      harBehandlingMedTrygdeavgift: false,
    });
  }),

  // 2. Hent fagsak
  http.get("/api/fagsaker/:saksnummer", ({ params }) => {
    const { saksnummer } = params;
    return HttpResponse.json({
      saksnummer,
      sakstype: { kode: "EU_EOS", term: "EØS" },
      sakstema: { kode: "MEDLEMSKAP_LOVVALG", term: "Medlemskap og lovvalg" },
      saksstatus: { kode: "UNDER_BEHANDLING", term: "Under behandling" },
      behandlingOversikter: [],
    });
  }),

  // 3. Hent dokumenter for fagsak
  http.get("/api/fagsaker/:saksnummer/dokumenter", () => {
    return HttpResponse.json([]);
  }),

  // 4. Hent behandling
  http.get("/api/behandlinger/:id", ({ params }) => {
    const { id } = params;
    if (id === "undefined") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      behandlingID: id,
      behandlingsstatus: { kode: "UNDER_BEHANDLING", term: "Under behandling" },
      behandlingstype: { kode: "FØRSTEGANG", term: "Førstegangsbehandling" },
    });
  }),

  // 5. Hent behandlingsresultat
  http.get("/api/behandlinger/:id/resultat", ({ params }) => {
    const { id } = params;
    if (id === "undefined") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      behandlingsresultatType: "",
    });
  }),

  // 6. Sjekk om BUC er åpen (brukes i vurderingGodkjennUtpekingAnnetLand)
  http.get("/api/kontroll/:id/erBucAapen", () => {
    return HttpResponse.json({ erBucAapen: false });
  }),

  // 7. Hent lovvalgsperioder
  http.get("/api/lovvalgsperioder/:id", ({ params }) => {
    const { id } = params;
    if (id === "undefined" || id === "-1") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      id,
      fom: "2024-01-01",
      tom: "2024-12-31",
      lovvalgsland: { kode: "NO", term: "Norge" },
    });
  }),

  // 8. Hent mottatte opplysninger
  http.get("/api/mottatteopplysninger/:id", ({ params }) => {
    const { id } = params;
    if (id === "undefined") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      brukerID: "12345678901",
      periode: { fom: "2024-01-01", tom: "2024-12-31" },
    });
  }),

  // 9. Hent landkoder (kodeverk)
  http.get("/api/kodeverk/nav-felles/LANDKODER_ISO2", () => {
    return HttpResponse.json([
      { kode: "NO", term: "Norge" },
      { kode: "SE", term: "Sverige" },
      { kode: "DK", term: "Danmark" },
    ]);
  }),
];
