import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";

export const matcherSoek = (blokk: TekstblokkOversikt, soek: string): boolean => {
  if (!soek) return true;
  const normalisert = soek.toLowerCase().trim();
  if (blokk.tittel.toLowerCase().includes(normalisert)) return true;
  return blokk.tags.some((tag) => tag.toLowerCase().includes(normalisert));
};

export const tellTags = (blokker: TekstblokkOversikt[]): Array<[string, number]> => {
  const teller = new Map<string, number>();
  blokker.forEach((blokk) => {
    blokk.tags.forEach((tag) => {
      teller.set(tag, (teller.get(tag) ?? 0) + 1);
    });
  });
  return Array.from(teller.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"));
};

export const filtrer = (blokker: TekstblokkOversikt[], soek: string, valgteTags: string[]): TekstblokkOversikt[] =>
  blokker.filter((blokk) => {
    if (!matcherSoek(blokk, soek)) return false;
    if (valgteTags.length === 0) return true;
    return valgteTags.some((tag) => blokk.tags.includes(tag));
  });
