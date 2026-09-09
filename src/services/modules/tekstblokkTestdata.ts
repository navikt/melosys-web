import { TekstblokkOversikt } from "./tekstblokker";

// Delt testfabrikk for TekstblokkOversikt. Basisobjektet er fullt typet, så et nytt
// obligatorisk felt i typen brekker kun denne fila – ikke hver testfil med egen kopi.
export const tekstblokkOversikt = (overstyringer: Partial<TekstblokkOversikt> = {}): TekstblokkOversikt => ({
  id: 1,
  tittel: "Tekstblokk",
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: [],
  sakstyper: [],
  sakstemaer: [],
  behandlingstemaer: [],
  status: "PUBLISERT",
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
  ...overstyringer,
});
