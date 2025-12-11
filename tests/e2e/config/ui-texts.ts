/**
 * UI text constants used across E2E tests
 * Centralized to avoid hardcoded strings and improve maintainability
 */

export const UI_TEXTS = {
  BUTTONS: {
    OPPRETT_NY_SAK: "Opprett ny sak/behandling",
    OPPRETT_NY_BEHANDLING: "Opprett ny behandling",
    AVBRYT: "Avbryt",
    VIS_FLERE_SAKER: "Vis flere saker",
    BEKREFT_OG_FORTSETT: "Bekreft og fortsett",
    BEKREFT: "Bekreft",
    TILBAKE: "Tilbake",
    SEND_BREV: "Send brev",
    AVSLUTT_BEHANDLING: "Avslutt behandling",
    LEGG_TIL_PERIODE: "Legg til periode",
    LEGG_TIL_SKATTEFORHOLD: "Legg til skatteforhold",
    LEGG_TIL_INNTEKT: "Legg til inntekt",
    ÅPNE_DATOVELGER: "Åpne datovelger",
  },
  HEADINGS: {
    MINE_OPPGAVER: "Mine oppgaver",
    SAKSOVERSIKT: "Saksoversikt",
    OPPGI_BRUKERS_INNTEKT: "Oppgi informasjon om brukers inntekt",
  },
  STEG: {
    OPPGI_OPPLYSNINGER: "Oppgi opplysninger fra søknaden",
    BESTEMMELSE_OG_VURDERING: "Bestemmelse og vurdering",
    BESTEMMELSE: "Bestemmelse",
    TRYGDEAVGIFT: "Trygdeavgift",
    MEDLEMSKAPSPERIODER: "Medlemskapsperioder",
    VIRKSOMHET: "Virksomhet",
    BEKREFTELSE: "Bekreftelse",
    PLIKTIG_MEDLEMSKAP: "Pliktig medlemskap etter folketrygdloven",
  },
  MESSAGES: {
    FØLGENDE_FEIL: "Følgende feil ble funnet",
    TIDLIGERE_BEHANDLING_AVSLUTTET: "Tidligere behandling er avsluttet",
    INGEN_SAKER_FUNNET: "Ingen eksisterende saker funnet. Du må opprette en ny sak.",
    AKTIV_BEHANDLING_FEIL: "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling",
  },
  LABELS: {
    BRUKER_FNR: "Brukers f.nr. eller d-nr.:",
    HVEM_SKAL_SAKEN_OPPRETTES_PÅ: "Hvem skal saken opprettes på?",
    KNYTT_TIL_EKSISTERENDE: "Knytt til eksisterende sak eller opprett ny",
    INFORMASJON_OM_BRUKER: "Informasjon om bruker",
    LEGG_I_MINE_OPPGAVER: "Legg behandlingen i mine oppgaver",
    BEHANDLINGSTYPE: "Behandlingstype",
    LAND: "Land",
    TRYGDEDEKNING: "Trygdedekning",
    BESTEMMELSE: "Bestemmelse",
    RESULTAT: "Resultat",
    BREVMAL: "Brevmal",
  },
  RADIO_OPTIONS: {
    BRUKER: "Bruker",
    VIRKSOMHET: "Virksomhet",
    OPPRETT_NY_SAK: "Opprett ny sak",
    EKSISTERENDE_SAK: "Eksisterende sak",
    JA: "Ja",
    NEI: "Nei",
  },
  BEHANDLING_STATUS: {
    OPPRETTET: "Behandlingen er opprettet",
    PÅGÅR: "Behandlingen pågår",
    AVSLUTTET: "Behandlingen er avsluttet",
    HENLAGT: "Søknaden er henlagt",
  },
  VEDTAK: {
    INNVILGET: "Søknaden er innvilget",
    AVSLAG: "Søknaden er avslått",
    DELVIS_INNVILGET: "Søknaden er delvis innvilget",
  },
} as const;
