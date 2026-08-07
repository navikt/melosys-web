import { useQuery } from "@tanstack/react-query";

import { hentKombinasjonstre, SakstypeNode } from "../modules/lovligekombinasjoner/kombinasjonstre";

export const kombinasjonstreKeys = {
  tre: ["lovligekombinasjoner", "tre"] as const,
};

// Treet er hardkodet i backend og kan per definisjon ikke endre seg før neste deploy, så
// en refetch ville aldri gitt noe nytt. gcTime følger med: uten den kastes treet ut av
// cachen etter fem minutter, og hentes på nytt ved neste modalåpning.
const FOR_ALLTID = Infinity;

export const useKombinasjonstre = () =>
  useQuery<SakstypeNode[]>({
    queryKey: kombinasjonstreKeys.tre,
    queryFn: hentKombinasjonstre,
    staleTime: FOR_ALLTID,
    gcTime: FOR_ALLTID,
  });
