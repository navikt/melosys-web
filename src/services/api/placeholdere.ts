import { useQuery } from "@tanstack/react-query";

import * as Placeholdere from "../modules/placeholdere";
import { PlaceholderVerdi } from "../modules/placeholdere";

export const placeholderKeys = {
  all: ["placeholdere"] as const,
  verdier: (behandlingId: number) => ["placeholdere", "verdier", behandlingId] as const,
};

// Verdiene skal være ferske per åpning av Send brev, men stabile innen økten.
const VERDIER_STALE_TIME = 5 * 60_000;

export const usePlaceholderVerdier = (behandlingId: number | null, enabled = true) =>
  useQuery<PlaceholderVerdi[]>({
    queryKey: placeholderKeys.verdier(behandlingId ?? 0),
    queryFn: () => Placeholdere.hentVerdier(behandlingId as number).then((respons) => respons.verdier),
    enabled: enabled && behandlingId !== null,
    staleTime: VERDIER_STALE_TIME,
  });
