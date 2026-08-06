import { useQuery } from "@tanstack/react-query";

import { hentKombinasjonstre, SakstypeNode } from "../modules/lovligekombinasjoner/kombinasjonstre";

export const kombinasjonstreKeys = {
  tre: ["lovligekombinasjoner", "tre"] as const,
};

// Treet er hardkodet i backend og endrer seg kun ved deploy, så det er trygt å holde
// lenge i cache. Ett kall dekker hele kaskaden i admin.
const TRE_STALE_TIME = 60 * 60_000;

export const useKombinasjonstre = (enabled = true) =>
  useQuery<SakstypeNode[]>({
    queryKey: kombinasjonstreKeys.tre,
    queryFn: hentKombinasjonstre,
    enabled,
    staleTime: TRE_STALE_TIME,
  });
