import { matcherSoek, TekstblokkOversikt } from "../../../services/modules/tekstblokker";

export { matcherSoek, tellTags, toggleITegnliste } from "../../../services/modules/tekstblokker";

export const filtrer = (blokker: TekstblokkOversikt[], soek: string, valgteTags: string[]): TekstblokkOversikt[] =>
  blokker.filter((blokk) => {
    if (!matcherSoek(blokk, soek)) return false;
    if (valgteTags.length === 0) return true;
    return valgteTags.some((tag) => blokk.tags.includes(tag));
  });
